-- ============================================================
-- Run this in MySQL Workbench (Ctrl+Shift+Enter to run the whole script)
-- Fixes: (1) missing UK states, (2) adds first/middle/last name columns to users
-- Safe to re-run.
-- ============================================================

USE volunteer_management;

-- 1. Add the missing UK states (England, Scotland, Wales, Northern Ireland)
INSERT IGNORE INTO State (state_name, country_id)
SELECT s.name, c.country_id FROM (
  SELECT 'England' name UNION SELECT 'Scotland' UNION SELECT 'Wales' UNION SELECT 'Northern Ireland'
) s
CROSS JOIN (SELECT country_id FROM Country WHERE country_code = 'GB') c;

-- 2. Add first_name / middle_name / last_name to users (only if missing)
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

-- 3. Backfill existing users (like "Manish Yadav") into first_name/last_name
UPDATE users
SET first_name = SUBSTRING_INDEX(full_name, ' ', 1),
    last_name = TRIM(SUBSTRING(full_name, LENGTH(SUBSTRING_INDEX(full_name, ' ', 1)) + 1))
WHERE first_name = '' OR first_name IS NULL;

SELECT CONCAT(
  'Done! UK states: ', (SELECT COUNT(*) FROM State s JOIN Country c ON s.country_id = c.country_id WHERE c.country_code = 'GB'),
  ' | Users with names: ', (SELECT COUNT(*) FROM users WHERE first_name != '')
) AS status;
