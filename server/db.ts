import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mysql, { Pool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const {
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = '3306',
  MYSQL_DATABASE = 'portal',
  MYSQL_USER = 'portal',
  MYSQL_PASSWORD = 'portalpass',
} = process.env;

export const pool: Pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  database: MYSQL_DATABASE,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  connectionLimit: 10,
});

export const initDb = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','user') NOT NULL DEFAULT 'user',
        status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        is_verified TINYINT(1) NOT NULL DEFAULT 0,
        verification_token VARCHAR(128),
        created_at BIGINT NOT NULL
      )
    `);

    // Add new columns for verification if they do not exist
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0`);
    } catch (e: any) {
      // Column exists
    }
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN verification_token VARCHAR(128)`);
    } catch (e: any) {
      // Column exists
    }

    // seed root admin if missing
    const [rows] = await conn.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, ['admin@portal.com']);
    if ((rows as any[]).length === 0) {
      const passwordHash = await bcrypt.hash('admin', 10);
      await conn.query(
        `INSERT INTO users (id, name, email, password_hash, role, status, is_verified, created_at) VALUES (?, ?, ?, ?, 'admin', 'approved', 1, ?)`,
        ['admin-001', 'System Admin', 'admin@portal.com', passwordHash, Date.now()]
      );
      console.log('Seeded admin@portal.com with password "admin"');
    }
  } finally {
    conn.release();
  }
};
