import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mysql, { Pool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at BIGINT NOT NULL,
        INDEX idx_category_name (name)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS apps (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        category VARCHAR(255) NOT NULL,
        created_at BIGINT NOT NULL,
        INDEX idx_category (category),
        INDEX idx_app_created_at (created_at)
      )
    `);

    const defaultCategories = ['Work', 'Social', 'Development', 'Media', 'Other'];
    await Promise.all(
      defaultCategories.map((cat) =>
        conn.query(`INSERT IGNORE INTO categories (id, name, created_at) VALUES (?, ?, ?)`, [
          uuidv4(),
          cat,
          Date.now(),
        ])
      )
    );

    const [appCountRows] = await conn.query(`SELECT COUNT(*) as cnt FROM apps`);
    const appCount = (appCountRows as any[])[0]?.cnt ?? 0;

    if (appCount === 0) {
      const seededAt = Date.now();
      const defaultApps = [
        {
          name: 'GitHub',
          url: 'https://github.com',
          description: 'Where the world builds software.',
          category: 'Development',
          imageUrl: 'https://picsum.photos/seed/github/400/200',
          createdAt: seededAt,
        },
        {
          name: 'YouTube',
          url: 'https://youtube.com',
          description: 'Enjoy the videos and music you love.',
          category: 'Media',
          imageUrl: 'https://picsum.photos/seed/youtube/400/200',
          createdAt: seededAt - 1000,
        },
        {
          name: 'Gmail',
          url: 'https://mail.google.com',
          description: 'Secure, smart, and easy to use email.',
          category: 'Work',
          imageUrl: 'https://picsum.photos/seed/gmail/400/200',
          createdAt: seededAt - 2000,
        },
      ];

      for (const app of defaultApps) {
        await conn.query(
          `INSERT INTO apps (id, name, url, description, image_url, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), app.name, app.url, app.description, app.imageUrl, app.category, app.createdAt]
        );
      }
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
