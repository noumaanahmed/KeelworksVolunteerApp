-- ============================================================
-- Run this in MySQL Workbench (Ctrl+Shift+Enter to run the whole script)
-- Adds interested_role to Employee so the applicant dashboard can show
-- which position someone applied for.
-- ============================================================

USE volunteer_management;

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'volunteer_management' AND TABLE_NAME = 'Employee' AND COLUMN_NAME = 'interested_role'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE Employee ADD COLUMN interested_role VARCHAR(255) NULL',
  'SELECT ''interested_role already exists'' AS note');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Employee.interested_role is ready' AS status;
