-- Portal Database Schema Initialization
-- Auto-run when MySQL container starts

CREATE DATABASE IF NOT EXISTS portal;
USE portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  verification_token VARCHAR(128),
  created_at BIGINT NOT NULL,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin)
INSERT IGNORE INTO users (id, name, email, password_hash, role, status, is_verified, created_at)
VALUES (
  'admin-001',
  'System Admin',
  'admin@portal.com',
  '$2a$10$9uNhOl/kUa7LqJFPZfFaAePjXCqxL.7VvlTiEpZXLJ9hC/ZHLz9F2', -- bcrypt hash of "admin"
  'admin',
  'approved',
  1,
  UNIX_TIMESTAMP() * 1000
);

-- Create indexes for better query performance
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_role (role);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_created_at (created_at);

-- Grant permissions to portal user
GRANT ALL PRIVILEGES ON portal.* TO 'portal'@'%' IDENTIFIED BY 'portalpass';
FLUSH PRIVILEGES;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at BIGINT NOT NULL,
  INDEX idx_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default categories
INSERT IGNORE INTO categories (id, name, created_at) VALUES
  (UUID(), 'Work', UNIX_TIMESTAMP() * 1000),
  (UUID(), 'Social', UNIX_TIMESTAMP() * 1000),
  (UUID(), 'Development', UNIX_TIMESTAMP() * 1000),
  (UUID(), 'Media', UNIX_TIMESTAMP() * 1000),
  (UUID(), 'Other', UNIX_TIMESTAMP() * 1000);

-- Apps table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed sample apps
INSERT IGNORE INTO apps (id, name, url, description, image_url, category, created_at) VALUES
  (UUID(), 'GitHub', 'https://github.com', 'Where the world builds software.', 'https://picsum.photos/seed/github/400/200', 'Development', UNIX_TIMESTAMP() * 1000),
  (UUID(), 'YouTube', 'https://youtube.com', 'Enjoy the videos and music you love.', 'https://picsum.photos/seed/youtube/400/200', 'Media', (UNIX_TIMESTAMP() * 1000) - 1000),
  (UUID(), 'Gmail', 'https://mail.google.com', 'Secure, smart, and easy to use email.', 'https://picsum.photos/seed/gmail/400/200', 'Work', (UNIX_TIMESTAMP() * 1000) - 2000);
