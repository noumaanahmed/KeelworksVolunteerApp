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

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.SUBMITTED]: "Submitted",
  [APPLICATION_STATUS.UNDER_REVIEW]: "Under Review",
  [APPLICATION_STATUS.FORWARDED]: "Forwarded to Lead",
  [APPLICATION_STATUS.ACCEPTED]: "Accepted",
  [APPLICATION_STATUS.ON_HOLD]: "On Hold",
  [APPLICATION_STATUS.DECLINED]: "Declined",
  [APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT]: "Acceptance Email Sent",
  [APPLICATION_STATUS.AWAITING_INTRO_RESPONSE]: "Awaiting Intro Response",
};

export const ALLOWED_STATUS_TRANSITIONS = {
  [APPLICATION_STATUS.SUBMITTED]: [
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.ACCEPTED,
    APPLICATION_STATUS.FORWARDED,
    APPLICATION_STATUS.ON_HOLD,
    APPLICATION_STATUS.DECLINED,
  ],
  [APPLICATION_STATUS.UNDER_REVIEW]: [
    APPLICATION_STATUS.ACCEPTED,
    APPLICATION_STATUS.FORWARDED,
    APPLICATION_STATUS.ON_HOLD,
    APPLICATION_STATUS.DECLINED,
  ],
  [APPLICATION_STATUS.FORWARDED]: [
    APPLICATION_STATUS.ACCEPTED,
    APPLICATION_STATUS.ON_HOLD,
    APPLICATION_STATUS.DECLINED,
  ],
  [APPLICATION_STATUS.ACCEPTED]: [APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT],
  [APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT]: [APPLICATION_STATUS.AWAITING_INTRO_RESPONSE],
  [APPLICATION_STATUS.ON_HOLD]: [
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.ACCEPTED,
    APPLICATION_STATUS.DECLINED,
  ],
  [APPLICATION_STATUS.DECLINED]: [],
  [APPLICATION_STATUS.AWAITING_INTRO_RESPONSE]: [],
};

export const ADMIN_STATUS_ACTIONS = {
  [APPLICATION_STATUS.SUBMITTED]: [
    {
      next_status: APPLICATION_STATUS.UNDER_REVIEW,
      label: "Start Review",
      helper: "Use this when an admin starts reviewing the application.",
    },
    {
      next_status: APPLICATION_STATUS.ACCEPTED,
      label: "Accept",
      helper: "Candidate meets immediate role needs. Next: send accepted application email.",
    },
    {
      next_status: APPLICATION_STATUS.FORWARDED,
      label: "Forward to Lead",
      helper: "Candidate appears qualified, but the role lead must approve.",
      requires_forwarded_to: true,
    },
    {
      next_status: APPLICATION_STATUS.ON_HOLD,
      label: "Put On Hold",
      helper: "Candidate is qualified, but there is no current opening.",
    },
    {
      next_status: APPLICATION_STATUS.DECLINED,
      label: "Decline",
      helper: "No matching position or applicant is not a fit.",
    },
  ],
  [APPLICATION_STATUS.UNDER_REVIEW]: [
    {
      next_status: APPLICATION_STATUS.ACCEPTED,
      label: "Accept",
      helper: "Candidate meets immediate role needs. Next: send accepted application email.",
    },
    {
      next_status: APPLICATION_STATUS.FORWARDED,
      label: "Forward to Lead",
      helper: "Candidate appears qualified, but the role lead must approve.",
      requires_forwarded_to: true,
    },
    {
      next_status: APPLICATION_STATUS.ON_HOLD,
      label: "Put On Hold",
      helper: "Candidate is qualified, but there is no current opening.",
    },
    {
      next_status: APPLICATION_STATUS.DECLINED,
      label: "Decline",
      helper: "No matching position or applicant is not a fit.",
    },
  ],
  [APPLICATION_STATUS.FORWARDED]: [
    {
      next_status: APPLICATION_STATUS.ACCEPTED,
      label: "Lead Accepted",
      helper: "Role lead approved. Next: send accepted application email.",
    },
    {
      next_status: APPLICATION_STATUS.ON_HOLD,
      label: "Lead Put On Hold",
      helper: "Role lead wants to keep the candidate warm for a future opening.",
    },
    {
      next_status: APPLICATION_STATUS.DECLINED,
      label: "Lead Declined",
      helper: "Role lead rejected the candidate.",
    },
  ],
  [APPLICATION_STATUS.ACCEPTED]: [
    {
      next_status: APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT,
      label: "Mark Acceptance Email Sent",
      helper: "Use after sending the Accepted Applications Gmail template manually.",
    },
  ],
  [APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT]: [
    {
      next_status: APPLICATION_STATUS.AWAITING_INTRO_RESPONSE,
      label: "Awaiting Intro Response",
      helper: "Use after asking the volunteer for intro meeting availability.",
    },
  ],
  [APPLICATION_STATUS.ON_HOLD]: [
    {
      next_status: APPLICATION_STATUS.UNDER_REVIEW,
      label: "Reopen Review",
      helper: "Use if a role opens up or new information is available.",
    },
    {
      next_status: APPLICATION_STATUS.ACCEPTED,
      label: "Accept",
      helper: "Use if the candidate can now be accepted.",
    },
    {
      next_status: APPLICATION_STATUS.DECLINED,
      label: "Decline",
      helper: "Use if the candidate should no longer remain on hold.",
    },
  ],
  [APPLICATION_STATUS.DECLINED]: [],
  [APPLICATION_STATUS.AWAITING_INTRO_RESPONSE]: [],
};

export const isKnownApplicationStatus = (status) =>
  Object.values(APPLICATION_STATUS).includes(status);

export const getAllowedTransitions = (currentStatus) =>
  ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

export const getStatusActions = (currentStatus) =>
  ADMIN_STATUS_ACTIONS[currentStatus] || [];
