-- ============================================================
-- KeelWorks Admin Status Workflow Migration
-- Run this only if you already have the professional MVP schema
-- and do not want to wipe existing data.
--
-- For a full reset, run docs/setup/00_RUN_ALL_IN_ORDER.sql.
-- ============================================================

USE volunteer_management;

SET SQL_SAFE_UPDATES = 0;

ALTER TABLE Employee
  MODIFY COLUMN application_status VARCHAR(50) NOT NULL DEFAULT 'submitted';

UPDATE Employee
SET application_status = CASE
  WHEN application_status IS NULL OR TRIM(application_status) = '' THEN 'submitted'
  WHEN LOWER(TRIM(application_status)) IN ('pending', 'new', 'submitted') THEN 'submitted'
  WHEN LOWER(TRIM(application_status)) IN ('reviewing', 'review', 'in review', 'under review', 'under_review') THEN 'under_review'
  WHEN LOWER(TRIM(application_status)) IN ('forwarded', 'forward') THEN 'forwarded'
  WHEN LOWER(TRIM(application_status)) IN ('approved', 'accepted', 'accept') THEN 'accepted'
  WHEN LOWER(TRIM(application_status)) IN ('on hold', 'on_hold', 'hold') THEN 'on_hold'
  WHEN LOWER(TRIM(application_status)) IN ('rejected', 'declined', 'reject') THEN 'declined'
  WHEN LOWER(TRIM(application_status)) IN ('acceptance_email_sent', 'acceptance email sent') THEN 'acceptance_email_sent'
  WHEN LOWER(TRIM(application_status)) IN ('awaiting_intro_response', 'awaiting intro response') THEN 'awaiting_intro_response'
  ELSE 'submitted'
END
WHERE employee_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS ApplicationStatusHistory (
  history_id          INT AUTO_INCREMENT PRIMARY KEY,
  employee_id         INT NOT NULL,
  previous_status     VARCHAR(50) NULL,
  new_status          VARCHAR(50) NOT NULL,
  note                TEXT NULL,
  forwarded_to        VARCHAR(255) NULL,
  action_label        VARCHAR(100) NULL,
  changed_by_user_id  INT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_status_history_employee
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_status_history_user
    FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_status_history_employee (employee_id),
  INDEX idx_status_history_status (new_status),
  INDEX idx_status_history_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO ApplicationStatusHistory (
  employee_id,
  previous_status,
  new_status,
  note,
  action_label,
  changed_by_user_id,
  created_at
)
SELECT
  e.employee_id,
  NULL,
  e.application_status,
  'Backfilled current application status during workflow migration.',
  'Backfilled Status',
  NULL,
  COALESCE(e.application_date, CURRENT_TIMESTAMP)
FROM Employee e
WHERE NOT EXISTS (
  SELECT 1
  FROM ApplicationStatusHistory h
  WHERE h.employee_id = e.employee_id
);

SET SQL_SAFE_UPDATES = 1;
