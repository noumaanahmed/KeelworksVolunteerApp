import React from "react";
import { statusClassName, statusLabel } from "../constants/applicationStatus";
import StatusActionPanel from "./StatusActionPanel";

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "—";
const formatDateTime = (value) => value ? new Date(value).toLocaleString() : "—";

const DetailRow = ({ label, value }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value || "—"}</span>
  </div>
);

const RecordCard = ({ title, children }) => (
  <div className="record-card">
    <h4>{title}</h4>
    {children}
  </div>
);

const ApplicationDetailModal = ({ application, loading, error, onClose, onStatusChange, statusBusy }) => {
  if (!application && !loading) return null;

  return (
    <div className="kw-modal-overlay" onClick={onClose}>
      <div className="kw-modal application-detail-modal" onClick={(event) => event.stopPropagation()}>
        <header className="kw-modal-header">
          <div>
            <h2>{application ? `Application #${application.application_number || application.employee_id}` : "Application Details"}</h2>
            {application && (
              <p>
                {application.first_name} {application.last_name} · {application.interested_role || "Volunteer Application"}
              </p>
            )}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close modal">✕</button>
        </header>

        <div className="kw-modal-body">
          {loading && <div className="loading-state">Loading application details...</div>}
          {error && <div className="error-banner">{error}</div>}

          {application && (
            <>
              <section className="detail-section detail-section--summary">
                <div>
                  <h3>Current Status</h3>
                  <span className={statusClassName(application.application_status)}>
                    {statusLabel(application.application_status, application.application_status_label)}
                  </span>
                </div>
                <div>
                  <h3>Submitted</h3>
                  <p>{formatDate(application.application_date)}</p>
                </div>
              </section>

              <StatusActionPanel
                application={application}
                onStatusChange={onStatusChange}
                busy={statusBusy}
              />

              <section className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <DetailRow label="Full Name" value={`${application.first_name} ${application.middle_name || ""} ${application.last_name}`.replace(/\s+/g, " ")} />
                  <DetailRow label="Email" value={application.personal_email} />
                  <DetailRow label="Phone" value={`${application.phone || "—"} ${application.phonetype ? `(${application.phonetype})` : ""}`} />
                  <DetailRow label="Gender" value={application.gender} />
                  <DetailRow label="Time Zone" value={application.time_zone} />
                  <DetailRow label="Visa Status" value={application.visa_status} />
                  <DetailRow label="OPT Support" value={application.opt_support} />
                  <DetailRow label="Hours Commitment" value={application.hours_commitment} />
                  <DetailRow label="Start Date" value={formatDate(application.start_date)} />
                  <DetailRow label="LinkedIn" value={application.linkedin_url} />
                  <DetailRow label="Additional Sites" value={application.additional_websites} />
                </div>
              </section>

              <section className="detail-section">
                <h3>Address</h3>
                <div className="detail-grid">
                  <DetailRow label="Address 1" value={application.address?.address1} />
                  <DetailRow label="Address 2" value={application.address?.address2} />
                  <DetailRow label="City" value={application.address?.city?.city_name} />
                  <DetailRow label="State / Province" value={application.address?.state?.state_name} />
                  <DetailRow label="Country" value={application.address?.country?.country_name} />
                  <DetailRow label="Zipcode" value={application.address?.zip_code} />
                </div>
              </section>

              <section className="detail-section">
                <h3>Application Answers</h3>
                <DetailRow label="Interested Role" value={application.interested_role} />
                <DetailRow label="Why KeelWorks" value={application.why_kworks} />
                <DetailRow label="Additional Info" value={application.additional_info} />
              </section>

              <section className="detail-section">
                <h3>Education</h3>
                {application.education?.length ? application.education.map((item) => (
                  <RecordCard key={item.education_id} title={item.institution_name}>
                    <DetailRow label="Degree" value={item.degree} />
                    <DetailRow label="Major" value={item.major} />
                    <DetailRow label="Dates" value={`${formatDate(item.start_date)} – ${formatDate(item.end_date)}`} />
                  </RecordCard>
                )) : <p className="empty-small">No education records.</p>}
              </section>

              <section className="detail-section">
                <h3>Employment</h3>
                {application.employment?.length ? application.employment.map((item) => (
                  <RecordCard key={item.employment_id} title={item.company_name}>
                    <DetailRow label="Job Title" value={item.job_title} />
                    <DetailRow label="Location" value={item.location} />
                    <DetailRow label="Dates" value={`${formatDate(item.start_date)} – ${formatDate(item.end_date)}`} />
                    <DetailRow label="Responsibilities" value={item.responsibilities} />
                  </RecordCard>
                )) : <p className="empty-small">No employment records.</p>}
              </section>

              <section className="detail-section">
                <h3>Status History</h3>
                {application.status_history?.length ? (
                  <ol className="status-timeline">
                    {application.status_history.map((item) => (
                      <li key={item.history_id}>
                        <div className="timeline-header">
                          <strong>{item.action_label || item.new_status_label}</strong>
                          <span>{formatDateTime(item.created_at)}</span>
                        </div>
                        <p>
                          {item.previous_status_label ? `${item.previous_status_label} → ` : ""}
                          {item.new_status_label}
                        </p>
                        {item.forwarded_to && <p>Forwarded to: {item.forwarded_to}</p>}
                        {item.note && <p className="timeline-note">{item.note}</p>}
                        {item.changed_by?.full_name && <p className="timeline-user">By {item.changed_by.full_name}</p>}
                      </li>
                    ))}
                  </ol>
                ) : <p className="empty-small">No status history yet.</p>}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;
