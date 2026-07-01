-- ============================================================
-- KeelWorks Admin Status Workflow Migration
-- Run this if you already have the professional MVP schema and do not
-- want to wipe existing data. For a full reset, run SQL_STARTUP_SCRIPT.sql.
-- ============================================================

USE volunteer_management;

-- Temporarily allow both old and new status values so existing rows can be converted safely.
ALTER TABLE Employee
  MODIFY application_status ENUM(
    'Pending',
    'Reviewing',
    'Approved',
    'Rejected',
    'submitted',
    'under_review',
    'forwarded',
    'accepted',
    'on_hold',
    'declined',
    'acceptance_email_sent',
    'awaiting_intro_response'
  ) NOT NULL DEFAULT 'submitted';

UPDATE Employee
SET application_status = CASE application_status
  WHEN 'Pending' THEN 'submitted'
  WHEN 'Reviewing' THEN 'under_review'
  WHEN 'Approved' THEN 'accepted'
  WHEN 'Rejected' THEN 'declined'
  ELSE application_status
END;

-- Finalize the enum after old values have been converted.
ALTER TABLE Employee
  MODIFY application_status ENUM(
    'submitted',
    'under_review',
    'forwarded',
    'accepted',
    'on_hold',
    'declined',
    'acceptance_email_sent',
    'awaiting_intro_response'
  ) NOT NULL DEFAULT 'submitted';

CREATE TABLE IF NOT EXISTS ApplicationStatusHistory (
  history_id          INT AUTO_INCREMENT PRIMARY KEY,
  employee_id         INT NOT NULL,
  previous_status     ENUM(
                        'submitted',
                        'under_review',
                        'forwarded',
                        'accepted',
                        'on_hold',
                        'declined',
                        'acceptance_email_sent',
                        'awaiting_intro_response'
                      ) NULL,
  new_status          ENUM(
                        'submitted',
                        'under_review',
                        'forwarded',
                        'accepted',
                        'on_hold',
                        'declined',
                        'acceptance_email_sent',
                        'awaiting_intro_response'
                      ) NOT NULL,
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
