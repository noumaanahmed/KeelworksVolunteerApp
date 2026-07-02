import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProfileMenu from "@keelworks/shared-ui/ProfileMenu";
import {
  fetchAdminApplicationDetail,
  fetchAdminApplications,
  updateApplicationStatus,
} from "../api/adminApplications";
import {
  APPLICATION_STATUS,
  STATUS_LABELS,
  statusClassName,
  statusLabel,
} from "../constants/applicationStatus";
import ApplicationDetailModal from "./ApplicationDetailModal";
import { createAdminSocket } from "../services/socket";
import "../styles/admin-dashboard.css";

const DEFAULT_APPLICATIONS_PER_PAGE = 20;
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "—";

const STATUS_FILTER_CARDS = [
  { key: "", label: "All statuses", statKey: "total" },
  { key: APPLICATION_STATUS.SUBMITTED, label: STATUS_LABELS[APPLICATION_STATUS.SUBMITTED], statKey: APPLICATION_STATUS.SUBMITTED },
  { key: APPLICATION_STATUS.UNDER_REVIEW, label: STATUS_LABELS[APPLICATION_STATUS.UNDER_REVIEW], statKey: APPLICATION_STATUS.UNDER_REVIEW },
  { key: APPLICATION_STATUS.FORWARDED, label: STATUS_LABELS[APPLICATION_STATUS.FORWARDED], statKey: APPLICATION_STATUS.FORWARDED },
  { key: APPLICATION_STATUS.ON_HOLD, label: STATUS_LABELS[APPLICATION_STATUS.ON_HOLD], statKey: APPLICATION_STATUS.ON_HOLD },
  { key: APPLICATION_STATUS.ACCEPTED, label: STATUS_LABELS[APPLICATION_STATUS.ACCEPTED], statKey: APPLICATION_STATUS.ACCEPTED },
  { key: APPLICATION_STATUS.DECLINED, label: STATUS_LABELS[APPLICATION_STATUS.DECLINED], statKey: APPLICATION_STATUS.DECLINED },
  { key: APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT, label: "Email Sent", statKey: APPLICATION_STATUS.ACCEPTANCE_EMAIL_SENT },
  { key: APPLICATION_STATUS.AWAITING_INTRO_RESPONSE, label: "Awaiting Intro", statKey: APPLICATION_STATUS.AWAITING_INTRO_RESPONSE },
];

const AdminDashboard = ({ user, token, onSignOut }) => {
  const [applications, setApplications] = useState([]);
  const [pageSize, setPageSize] = useState(DEFAULT_APPLICATIONS_PER_PAGE);
  const [pagination, setPagination] = useState({ total: 0, current_page: 1, total_pages: 1, per_page: DEFAULT_APPLICATIONS_PER_PAGE });
  const [statusCounts, setStatusCounts] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("kw_admin_theme") || "light");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);

  const isDark = theme === "dark";

  const addNotification = useCallback((message) => {
    setNotifications((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...current,
    ].slice(0, 6));
  }, []);

  const fetchApplications = useCallback(async (p = 1, filter = statusFilter) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAdminApplications({ token, page: p, limit: pageSize, status: filter });
      setApplications(data?.applications || []);
      setStatusCounts(data?.status_counts || { total: data?.pagination?.total || 0 });
      setPagination(data?.pagination || { total: 0, current_page: p, total_pages: 1, per_page: pageSize });
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, pageSize]);

  useEffect(() => {
    fetchApplications(page, statusFilter);
  }, [page, statusFilter, fetchApplications]);

  useEffect(() => {
    localStorage.setItem("kw_admin_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = createAdminSocket(token);

    socket.on("connect", () => {
      console.log("Admin realtime connected:", socket.id);
    });

    socket.on("application:created", async ({ application } = {}) => {
      console.log("Realtime event received: application created");
      addNotification(
        application
          ? `New application received from ${application.first_name || "an applicant"} ${application.last_name || ""}.`.trim()
          : "New application received."
      );
      await fetchApplications(page, statusFilter);
    });

    socket.on("application:statusUpdated", async ({ application }) => {
      console.log("Realtime event received: application status updated");
      if (application) {
        addNotification(
          `Application #${application.application_number || application.employee_id} changed to ${statusLabel(application.application_status, application.application_status_label)}.`
        );
      }

      await fetchApplications(page, statusFilter);

      if (!application) return;

      setSelectedApplication((currentSelectedApplication) =>
        currentSelectedApplication?.employee_id === application.employee_id
          ? application
          : currentSelectedApplication
      );
    });

    socket.on("connect_error", (error) => {
      console.error("Admin realtime connection failed:", error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, page, statusFilter, fetchApplications, addNotification]);

  const filterCards = useMemo(() => STATUS_FILTER_CARDS.map((card) => ({
    ...card,
    count: statusCounts?.[card.statKey] || 0,
  })), [statusCounts]);

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
      addNotification(
        `Application #${updatedApplication.application_number || updatedApplication.employee_id} changed to ${statusLabel(updatedApplication.application_status, updatedApplication.application_status_label)}.`
      );
      await fetchApplications(page, statusFilter);
    } catch (err) {
      setDetailError(err.message || "Failed to update application status");
    } finally {
      setStatusBusy(false);
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  return (
    <div className={`admin-page ${isDark ? "admin-page--dark" : ""}`}>
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>KeelWorks Volunteer Applications</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="header-pill-button"
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          >
            {isDark ? "☀️ Light" : "🌙 Night"}
          </button>
          <div className="notification-wrapper">
            <button
              type="button"
              className="header-pill-button notification-button"
              onClick={() => setShowNotifications((current) => !current)}
            >
              🔔 Notifications
              {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
            </button>
            {showNotifications && (
              <div className="notification-menu">
                <h3>Recent updates</h3>
                {notifications.length === 0 ? (
                  <p>No realtime updates yet.</p>
                ) : notifications.map((item) => (
                  <div className="notification-item" key={item.id}>
                    <span>{item.message}</span>
                    <small>{item.createdAt}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ProfileMenu name={user.full_name} onSignOut={onSignOut} dark={true} />
        </div>
      </header>

      <main className="admin-main">
        <section className="stats-grid status-card-grid" aria-label="Filter applications by workflow status">
          {filterCards.map((card) => (
            <button
              key={card.label}
              type="button"
              className={`stat-card stat-card--button status-filter-card ${statusFilter === card.key ? "stat-card--active" : ""}`}
              onClick={() => handleFilterChange(card.key)}
              aria-pressed={statusFilter === card.key}
            >
              <strong>{card.count}</strong>
              <span>{card.label}</span>
            </button>
          ))}
        </section>

        {statusFilter && (
          <div className="active-filter-bar">
            Showing {STATUS_LABELS[statusFilter] || statusFilter} applications.
            <button type="button" onClick={() => handleFilterChange("")}>Clear filter</button>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <section className="applications-card">
          <div className="admin-card-header admin-card-header--split">
            <div>
              <h2>Applications</h2>
              <p>Review submissions and move candidates through the onboarding decision workflow.</p>
            </div>
            <label className="page-size-control">
              <span>Show</span>
              <select value={pageSize} onChange={handlePageSizeChange}>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span>per page</span>
            </label>
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
                      <td>#{application.application_number || application.employee_id}</td>
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
