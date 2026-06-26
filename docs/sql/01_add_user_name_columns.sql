-- ============================================================
-- Run this in MySQL Workbench (Ctrl+Shift+Enter to run the whole script)
-- Adds first_name, middle_name, last_name to the existing users table
-- Safe to re-run: checks information_schema before adding each column
-- ============================================================

USE volunteer_management;

-- Add first_name only if it doesn't already exist
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'volunteer_management' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'first_name'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT ''''',
  'SELECT ''first_name already exists'' AS note');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add middle_name only if it doesn't already exist
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'volunteer_management' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'middle_name'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN middle_name VARCHAR(50) NULL',
  'SELECT ''middle_name already exists'' AS note');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add last_name only if it doesn't already exist
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'volunteer_management' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_name'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT ''''',
  'SELECT ''last_name already exists'' AS note');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill any existing users by splitting their full_name into first/last
UPDATE users
SET first_name = SUBSTRING_INDEX(full_name, ' ', 1),
    last_name = TRIM(SUBSTRING(full_name, LENGTH(SUBSTRING_INDEX(full_name, ' ', 1)) + 1))
WHERE first_name = '' OR first_name IS NULL;

SELECT 'users table updated with first_name, middle_name, last_name' AS status;
