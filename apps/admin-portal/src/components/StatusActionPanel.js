import React, { useMemo, useState } from "react";
const EMPTY_ACTIONS = [];

const StatusActionPanel = ({ application, onStatusChange, busy }) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [note, setNote] = useState("");
  const [forwardedTo, setForwardedTo] = useState("");

  const nextActions = application?.next_actions || EMPTY_ACTIONS;;
  const selectedAction = useMemo(
    () => nextActions.find((action) => action.next_status === selectedStatus),
    [nextActions, selectedStatus]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedStatus || busy) return;

    onStatusChange({
      status: selectedStatus,
      note,
      forwardedTo,
    });
  };

  if (!nextActions.length) {
    return (
      <section className="detail-section status-action-panel">
        <h3>Available Actions</h3>
        <p className="workflow-helper-text">
          There are no next workflow actions available for this status.
        </p>
      </section>
    );
  }

  return (
    <section className="detail-section status-action-panel">
      <h3>Available Actions</h3>
      <p className="workflow-helper-text">
        Choose the next action after reviewing the application and any hiring manager notes.
      </p>

      <div className="action-chip-list">
        {nextActions.map((action) => (
          <button
            key={action.next_status}
            type="button"
            className={`action-chip ${selectedStatus === action.next_status ? "action-chip--selected" : ""}`}
            onClick={() => setSelectedStatus(action.next_status)}
            disabled={busy}
          >
            {action.label}
          </button>
        ))}
      </div>

      {selectedAction && (
        <form className="status-action-form" onSubmit={handleSubmit}>
          <div className="status-action-help">
            <strong>Next step:</strong> {selectedAction.helper}
          </div>

          {selectedAction.requires_forwarded_to && (
            <label className="form-field">
              Lead email or lead name <span className="required">*</span>
              <input
                value={forwardedTo}
                onChange={(event) => setForwardedTo(event.target.value)}
                placeholder="role.lead@keelworks.org or Lead Name"
                required
              />
            </label>
          )}

          <label className="form-field">
            Internal note
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add context for the tracker, such as hiring manager feedback, alternate role suggestion, or reason for decision."
              rows={4}
            />
          </label>

          <button className="primary-action-button" type="submit" disabled={busy}>
            {busy ? "Updating..." : `Confirm: ${selectedAction.label}`}
          </button>
        </form>
      )}
    </section>
  );
};

export default StatusActionPanel;
