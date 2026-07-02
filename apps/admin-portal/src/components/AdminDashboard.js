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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [appliedDateStartFilter, setAppliedDateStartFilter] = useState("");
  const [appliedDateEndFilter, setAppliedDateEndFilter] = useState("");
  const [appliedDateDraftStart, setAppliedDateDraftStart] = useState("");
  const [appliedDateDraftEnd, setAppliedDateDraftEnd] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [columnFilterOpen, setColumnFilterOpen] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ roles: [], applied_dates: [] });

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

  const fetchApplications = useCallback(async (
    p = 1,
    filter = statusFilter,
    query = searchQuery,
    role = roleFilter,
    appliedDateStart = appliedDateStartFilter,
    appliedDateEnd = appliedDateEndFilter,
    sortColumn = sortBy,
    sort = sortDirection
  ) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAdminApplications({
        token,
        page: p,
        limit: pageSize,
        status: filter,
        search: query,
        role,
        appliedDateStart,
        appliedDateEnd,
        sortBy: sortColumn,
        sort,
      });
      setApplications(data?.applications || []);
      setStatusCounts(data?.status_counts || { total: data?.pagination?.total || 0 });
      setFilterOptions(data?.filter_options || { roles: [], applied_dates: [] });
      setPagination(data?.pagination || { total: 0, current_page: p, total_pages: 1, per_page: pageSize });
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, pageSize, searchQuery, roleFilter, appliedDateStartFilter, appliedDateEndFilter, sortBy, sortDirection]);

  useEffect(() => {
    fetchApplications(page, statusFilter, searchQuery, roleFilter, appliedDateStartFilter, appliedDateEndFilter, sortBy, sortDirection);
  }, [page, statusFilter, searchQuery, roleFilter, appliedDateStartFilter, appliedDateEndFilter, sortBy, sortDirection, fetchApplications]);

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
      await fetchApplications(page, statusFilter, searchQuery, roleFilter, appliedDateStartFilter, appliedDateEndFilter, sortBy, sortDirection);
    });

    socket.on("application:statusUpdated", async ({ application }) => {
      console.log("Realtime event received: application status updated");
      if (application) {
        addNotification(
          `Application #${application.application_number || application.employee_id} changed to ${statusLabel(application.application_status, application.application_status_label)}.`
        );
      }

      await fetchApplications(page, statusFilter, searchQuery, roleFilter, appliedDateStartFilter, appliedDateEndFilter, sortBy, sortDirection);

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
  }, [token, page, statusFilter, searchQuery, roleFilter, appliedDateStartFilter, appliedDateEndFilter, sortBy, sortDirection, fetchApplications, addNotification]);

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
      await fetchApplications(page, statusFilter, searchQuery, roleFilter, appliedDateStartFilter, appliedDateEndFilter, sortBy, sortDirection);
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

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(searchText.trim());
    setPage(1);
  };

  const handleSearchClear = () => {
    setSearchText("");
    setSearchQuery("");
    setPage(1);
  };

  const clearAllFilters = () => {
    setStatusFilter("");
    setSearchText("");
    setSearchQuery("");
    setRoleFilter("");
    setAppliedDateStartFilter("");
    setAppliedDateEndFilter("");
    setAppliedDateDraftStart("");
    setAppliedDateDraftEnd("");
    setColumnFilterOpen(null);
    setPage(1);
  };

  const handleSortChange = (column) => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortBy("");
      setSortDirection("");
    }

    setPage(1);
  };

  const sortIndicator = (column) => {
    if (sortBy !== column) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    setColumnFilterOpen(null);
    setPage(1);
  };

  const openColumnFilter = (filterName) => {
    setColumnFilterOpen((current) => {
      const next = current === filterName ? null : filterName;
      if (next === "applied") {
        setAppliedDateDraftStart(appliedDateStartFilter);
        setAppliedDateDraftEnd(appliedDateEndFilter);
      }
      return next;
    });
  };

  const applyDateRangeFilter = () => {
    setAppliedDateStartFilter(appliedDateDraftStart);
    setAppliedDateEndFilter(appliedDateDraftEnd);
    setColumnFilterOpen(null);
    setPage(1);
  };

  const clearAppliedDateFilter = () => {
    setAppliedDateStartFilter("");
    setAppliedDateEndFilter("");
    setAppliedDateDraftStart("");
    setAppliedDateDraftEnd("");
    setColumnFilterOpen(null);
    setPage(1);
  };

  const clearRoleFilter = () => {
    setRoleFilter("");
    setColumnFilterOpen(null);
    setPage(1);
  };

  const activeFilters = [
    statusFilter && { key: "status", label: `Status: ${STATUS_LABELS[statusFilter] || statusFilter}`, onClear: () => handleFilterChange("") },
    searchQuery && { key: "search", label: `Search: ${searchQuery}`, onClear: handleSearchClear },
    roleFilter && { key: "role", label: `Role: ${roleFilter}`, onClear: clearRoleFilter },
    (appliedDateStartFilter || appliedDateEndFilter) && {
      key: "applied-date",
      label: `Applied: ${appliedDateStartFilter ? formatDate(appliedDateStartFilter) : "Any"} – ${appliedDateEndFilter ? formatDate(appliedDateEndFilter) : "Any"}`,
      onClear: clearAppliedDateFilter,
    },
    sortBy && { key: "sort", label: `Sort: ${sortBy} ${sortDirection === "asc" ? "ascending" : "descending"}`, onClear: () => { setSortBy(""); setSortDirection(""); setPage(1); } },
  ].filter(Boolean);

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

        {activeFilters.length > 0 && (
          <div className="active-filter-bar" aria-label="Active filters">
            <div className="active-filter-chips">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className="active-filter-chip"
                  onClick={filter.onClear}
                  title={`Clear ${filter.label}`}
                >
                  <span>{filter.label}</span>
                  <strong aria-hidden="true">×</strong>
                </button>
              ))}
            </div>
            <button type="button" className="clear-all-filters-button" onClick={clearAllFilters}>Clear all</button>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <section className="applications-card">
          <div className="admin-card-header admin-card-header--split">
            <div>
              <h2>Applications</h2>
              <p>Review submissions and move candidates through the onboarding decision workflow.</p>
            </div>
            <div className="admin-toolbar" aria-label="Application search and display controls">
              <button
                type="button"
                className={`toolbar-icon-button ${searchOpen ? "toolbar-icon-button--active" : ""}`}
                onClick={() => setSearchOpen((current) => !current)}
                aria-label="Search applications"
                title="Search by name or email"
              >
                🔍
              </button>

              <form
                className={`admin-search-form ${searchOpen || searchQuery ? "admin-search-form--open" : ""}`}
                onSubmit={handleSearchSubmit}
              >
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search name or email"
                  aria-label="Search applications by name or email"
                />
                <button type="submit">Search</button>
                {(searchText || searchQuery) && (
                  <button type="button" className="toolbar-link-button" onClick={handleSearchClear}>
                    Clear
                  </button>
                )}
              </form>


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
                    <th>
                      <button type="button" className="table-header-button" onClick={() => handleSortChange("id")}>
                        ID <span>{sortIndicator("id")}</span>
                      </button>
                    </th>
                    <th>
                      <button type="button" className="table-header-button" onClick={() => handleSortChange("name")}>
                        Name <span>{sortIndicator("name")}</span>
                      </button>
                    </th>
                    <th>
                      <button type="button" className="table-header-button" onClick={() => handleSortChange("email")}>
                        Email <span>{sortIndicator("email")}</span>
                      </button>
                    </th>
                    <th>
                      <div className="column-filter-wrapper">
                        <button
                          type="button"
                          className={`table-header-button table-filter-button ${roleFilter ? "table-filter-button--active" : ""}`}
                          onClick={() => openColumnFilter("role")}
                        >
                          Role <span>{roleFilter ? "●" : "▾"}</span>
                        </button>
                        {columnFilterOpen === "role" && (
                          <div className="column-filter-menu">
                            <div className="column-filter-menu-header">
                              <strong>Filter by role</strong>
                              <button type="button" onClick={clearRoleFilter} disabled={!roleFilter}>Clear</button>
                            </div>
                            <button type="button" onClick={() => handleRoleFilterChange("")}>All roles</button>
                            {(filterOptions.roles || []).map((role) => (
                              <button
                                type="button"
                                key={role}
                                className={roleFilter === role ? "column-filter-option--active" : ""}
                                onClick={() => handleRoleFilterChange(role)}
                              >
                                {role}
                              </button>
                            ))}
                            {(filterOptions.roles || []).length === 0 && <span>No roles available</span>}
                          </div>
                        )}
                      </div>
                    </th>
                    <th>Status</th>
                    <th>
                      <div className="column-filter-wrapper">
                        <button
                          type="button"
                          className={`table-header-button table-filter-button ${(appliedDateStartFilter || appliedDateEndFilter) ? "table-filter-button--active" : ""}`}
                          onClick={() => openColumnFilter("applied")}
                        >
                          Applied <span>{(appliedDateStartFilter || appliedDateEndFilter) ? "●" : "▾"}</span>
                        </button>
                        {columnFilterOpen === "applied" && (
                          <div className="column-filter-menu column-filter-menu--right column-filter-menu--date-range">
                            <div className="column-filter-menu-header">
                              <strong>Applied date range</strong>
                              <button type="button" onClick={clearAppliedDateFilter} disabled={!appliedDateStartFilter && !appliedDateEndFilter}>Clear</button>
                            </div>
                            <label className="date-range-field">
                              <span>From</span>
                              <input
                                type="date"
                                value={appliedDateDraftStart}
                                onChange={(event) => setAppliedDateDraftStart(event.target.value)}
                              />
                            </label>
                            <label className="date-range-field">
                              <span>To</span>
                              <input
                                type="date"
                                value={appliedDateDraftEnd}
                                onChange={(event) => setAppliedDateDraftEnd(event.target.value)}
                              />
                            </label>
                            <button type="button" className="column-filter-apply-button" onClick={applyDateRangeFilter}>Apply range</button>
                          </div>
                        )}
                      </div>
                    </th>
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
