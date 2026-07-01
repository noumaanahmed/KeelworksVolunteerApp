export const APPLICATION_STATUS = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  FORWARDED: "forwarded",
  ACCEPTED: "accepted",
  ON_HOLD: "on_hold",
  DECLINED: "declined",
  ACCEPTANCE_EMAIL_SENT: "acceptance_email_sent",
  AWAITING_INTRO_RESPONSE: "awaiting_intro_response",
};

export const STATUS_LABELS = {
  [APPLICATION_STATUS.SUBMITTED]: "Submitted",
  [APPLICATION_STATUS.UNDER_REVIEW]: "Under Review",
  [APPLICATION_STATUS.FORWARDED]: "Forwarded to Lead",
  [APPLICATION_STATUS.ACCEPTED]: "Accepted",
  [APPLICATION_STATUS.ON_HOLD]: "On Hold",
  [APPLICATION_STATUS.DECLINED]: "Declined",
  [APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT]: "Acceptance Email Sent",
  [APPLICATION_STATUS.AWAITING_INTRO_RESPONSE]: "Awaiting Intro Response",
};

export const STATUS_CLASS_NAMES = {
  [APPLICATION_STATUS.SUBMITTED]: "status-badge--submitted",
  [APPLICATION_STATUS.UNDER_REVIEW]: "status-badge--under-review",
  [APPLICATION_STATUS.FORWARDED]: "status-badge--forwarded",
  [APPLICATION_STATUS.ACCEPTED]: "status-badge--accepted",
  [APPLICATION_STATUS.ON_HOLD]: "status-badge--on-hold",
  [APPLICATION_STATUS.DECLINED]: "status-badge--declined",
  [APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT]: "status-badge--acceptance-email-sent",
  [APPLICATION_STATUS.AWAITING_INTRO_RESPONSE]: "status-badge--awaiting-intro-response",
};

export const statusLabel = (status, fallback = "Unknown") =>
  STATUS_LABELS[status] || fallback;

export const statusClassName = (status) =>
  `status-badge ${STATUS_CLASS_NAMES[status] || "status-badge--default"}`;
