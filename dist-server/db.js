"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.local' });
const promise_1 = __importDefault(require("mysql2/promise"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const { MYSQL_HOST = 'localhost', MYSQL_PORT = '3306', MYSQL_DATABASE = 'portal', MYSQL_USER = 'portal', MYSQL_PASSWORD = 'portalpass', } = process.env;
exports.pool = promise_1.default.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    connectionLimit: 10,
});
const initDb = async () => {
    const conn = await exports.pool.getConnection();
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
        }
        catch (e) {
            // Column exists
        }
        try {
            await conn.query(`ALTER TABLE users ADD COLUMN verification_token VARCHAR(128)`);
        }
        catch (e) {
            // Column exists
        }
        // seed root admin if missing
        const [rows] = await conn.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, ['admin@portal.com']);
        if (rows.length === 0) {
            const passwordHash = await bcryptjs_1.default.hash('admin', 10);
            await conn.query(`INSERT INTO users (id, name, email, password_hash, role, status, is_verified, created_at) VALUES (?, ?, ?, ?, 'admin', 'approved', 1, ?)`, ['admin-001', 'System Admin', 'admin@portal.com', passwordHash, Date.now()]);
            console.log('Seeded admin@portal.com with password "admin"');
        }
    }
    finally {
        conn.release();
    }
};
exports.initDb = initDb;
