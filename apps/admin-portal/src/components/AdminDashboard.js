import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProfileMenu from "@keelworks/shared-ui/ProfileMenu";
import {
  fetchAdminApplicationDetail,
  fetchAdminApplications,
  updateApplicationStatus,
} from "../api/adminApplications";
import { APPLICATION_STATUS, statusClassName, statusLabel } from "../constants/applicationStatus";
import ApplicationDetailModal from "./ApplicationDetailModal";
import "../styles/admin-dashboard.css";

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "—";

const AdminDashboard = ({ user, token, onSignOut }) => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, current_page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);

  const fetchApplications = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAdminApplications({ token, page: p, limit: 10 });
      setApplications(data?.applications || []);
      setPagination(data?.pagination || { total: 0, current_page: p, total_pages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchApplications(page);
  }, [page, fetchApplications]);

  const stats = useMemo(() => ({
    total: pagination.total || 0,
    submitted: applications.filter((a) => a.application_status === APPLICATION_STATUS.SUBMITTED).length,
    forwarded: applications.filter((a) => a.application_status === APPLICATION_STATUS.FORWARDED).length,
    accepted: applications.filter((a) => a.application_status === APPLICATION_STATUS.ACCEPTED).length,
    declined: applications.filter((a) => a.application_status === APPLICATION_STATUS.DECLINED).length,
  }), [applications, pagination.total]);

  const openApplication = async (employeeId) => {
    setSelectedApplication(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const application = await fetchAdminApplicationDetail({ token, employeeId });
      setSelectedApplication(application);
    } catch (err) {
      setDetailError(err.message || "Failed to load application details");
      setSelectedApplication({ employee_id: employeeId });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeApplication = () => {
    setSelectedApplication(null);
    setDetailError("");
  };

  const handleStatusChange = async ({ status, note, forwardedTo }) => {
    if (!selectedApplication?.employee_id) return;

    setStatusBusy(true);
    setDetailError("");

    try {
      const updatedApplication = await updateApplicationStatus({
        token,
        employeeId: selectedApplication.employee_id,
        status,
        note,
        forwardedTo,
      });

      setSelectedApplication(updatedApplication);
      await fetchApplications(page);
    } catch (err) {
      setDetailError(err.message || "Failed to update application status");
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>KeelWorks Volunteer Applications</p>
        </div>
        <ProfileMenu name={user.full_name} onSignOut={onSignOut} dark={true} />
      </header>

      <main className="admin-main">
        <section className="stats-grid" aria-label="Application summary">
          <div className="stat-card"><strong>{stats.total}</strong><span>Total</span></div>
          <div className="stat-card"><strong>{stats.submitted}</strong><span>Submitted</span></div>
          <div className="stat-card"><strong>{stats.forwarded}</strong><span>Forwarded</span></div>
          <div className="stat-card"><strong>{stats.accepted}</strong><span>Accepted</span></div>
          <div className="stat-card"><strong>{stats.declined}</strong><span>Declined</span></div>
        </section>

        {error && <div className="error-banner">{error}</div>}

        <section className="applications-card">
          <div className="card-header">
            <div>
              <h2>Applications</h2>
              <p>Review submissions and move candidates through the onboarding decision workflow.</p>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">No applications found.</div>
          ) : (
            <div className="table-scroll">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.employee_id}>
                      <td>#{application.employee_id}</td>
                      <td>{application.first_name} {application.last_name}</td>
                      <td>{application.personal_email}</td>
                      <td>{application.interested_role || "—"}</td>
                      <td>
                        <span className={statusClassName(application.application_status)}>
                          {statusLabel(application.application_status, application.application_status_label)}
                        </span>
                      </td>
                      <td>{formatDate(application.application_date)}</td>
                      <td>
                        <button className="secondary-action-button" onClick={() => openApplication(application.employee_id)}>
                          View & Act
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.total_pages > 1 && (
            <div className="pagination-bar">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span>Page {pagination.current_page} of {pagination.total_pages}</span>
              <button disabled={page >= pagination.total_pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </section>
      </main>

      {(selectedApplication || detailLoading) && (
        <ApplicationDetailModal
          application={selectedApplication}
          loading={detailLoading}
          error={detailError}
          onClose={closeApplication}
          onStatusChange={handleStatusChange}
          statusBusy={statusBusy}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
