import React, { useState, useEffect, useCallback } from "react";
import ProfileMenu from "@keelworks/shared-ui/ProfileMenu";

import { API_BASE_URL } from "../config/api";
import { createApplicantSocket } from "../services/socket";

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  forwarded: "Forwarded to Lead",
  accepted: "Accepted",
  on_hold: "On Hold",
  declined: "Declined",
  acceptance_email_sent: "Acceptance Email Sent",
  awaiting_intro_response: "Awaiting Intro Response",
};

const STATUS_COLORS = {
  submitted: "#d97706",
  under_review: "#2563eb",
  forwarded: "#7c3aed",
  accepted: "#059669",
  on_hold: "#f59e0b",
  declined: "#dc2626",
  acceptance_email_sent: "#0f766e",
  awaiting_intro_response: "#475569",
};

const TERMINAL_REAPPLY_STATUSES = new Set(["declined"]);

const getApiErrorMessage = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.error === "string") return data.error;
  if (data.error?.code) return data.error.code;
  return fallback;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const ApplicantDashboard = ({ user, token, onSignOut, onStartApplication, theme: controlledTheme, onToggleTheme }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localTheme, setLocalTheme] = useState(() => localStorage.getItem("kw_applicant_theme") || "light");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedApplicationId, setExpandedApplicationId] = useState(null);

  const theme = controlledTheme || localTheme;
  const isDark = theme === "dark";

  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
      return;
    }

    setLocalTheme((current) => current === "dark" ? "light" : "dark");
  };

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

  const fetchMyApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/applications/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setApplications(data.data.applications || []);
      } else {
        setError(getApiErrorMessage(data, "Failed to load your applications"));
      }
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMyApplications(); }, [fetchMyApplications]);

  useEffect(() => {
    if (!controlledTheme) localStorage.setItem("kw_applicant_theme", localTheme);
  }, [controlledTheme, localTheme]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = createApplicantSocket(token);

    socket.on("connect", () => {
      console.log("Applicant realtime connected:", socket.id);
    });

    socket.on("application:statusUpdated", async ({ application } = {}) => {
      console.log("Realtime event received: application status updated");
      addNotification(
        application
          ? `Your application status changed to ${application.application_status_label || STATUS_LABELS[application.application_status] || application.application_status}.`
          : "Your application was updated."
      );
      await fetchMyApplications();
    });

    socket.on("connect_error", (error) => {
      console.error("Applicant realtime connection failed:", error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, fetchMyApplications, addNotification]);

  const hasInProgressApplication = applications.some(
    (app) => !TERMINAL_REAPPLY_STATUSES.has(app.application_status)
  );
  const canStartApplication = applications.length === 0 || !hasInProgressApplication;
  const startApplicationHelp = canStartApplication
    ? applications.length === 0
      ? "Start your first volunteer application."
      : "Your previous application was declined, so you may submit a new application."
    : "You already have an application in progress. You can submit another only if the current application is declined.";

  const palette = isDark ? {
    page: "#101827",
    header: "#122f4d",
    card: "#172335",
    softCard: "#1d2b40",
    text: "#e5edf7",
    muted: "#aab7c8",
    border: "#26364d",
    rowBorder: "#26364d",
    empty: "#aab7c8",
    button: "#2d6a9f",
    disabled: "#334155",
  } : {
    page: "#f3f4f6",
    header: "#1a3c5e",
    card: "#fff",
    softCard: "#f8fafc",
    text: "#222",
    muted: "#667085",
    border: "#e5e7eb",
    rowBorder: "#f0f0f0",
    empty: "#666",
    button: "#1a3c5e",
    disabled: "#d1d5db",
  };

  const s = {
    page: { minHeight: "100vh", background: palette.page, color: palette.text, fontFamily: "Arial, sans-serif", transition: "background 180ms ease, color 180ms ease" },
    header: { background: palette.header, color: "#fff", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px" },
    title: { margin: "0 0 4px", fontSize: "22px" },
    subtitle: { margin: 0, fontSize: "13px", opacity: 0.75 },
    headerActions: { display: "flex", alignItems: "center", gap: "12px", position: "relative" },
    pillButton: { border: "1px solid rgba(255,255,255,0.28)", borderRadius: "999px", background: "rgba(255,255,255,0.12)", color: "#fff", padding: "9px 13px", fontWeight: 700, cursor: "pointer" },
    notificationCount: { background: "#f7b500", color: "#173e63", borderRadius: "999px", padding: "1px 7px", marginLeft: "7px", fontSize: "12px" },
    notificationMenu: { position: "absolute", right: "110px", top: "46px", width: "290px", background: palette.card, color: palette.text, border: `1px solid ${palette.border}`, borderRadius: "12px", padding: "14px", zIndex: 10, boxShadow: "0 14px 40px rgba(0,0,0,0.18)" },
    notificationItem: { borderTop: `1px solid ${palette.border}`, padding: "10px 0", fontSize: "13px" },
    body: { maxWidth: "860px", margin: "32px auto", padding: "0 20px" },
    card: { background: palette.card, border: `1px solid ${palette.border}`, borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "24px", marginBottom: "20px", transition: "background 180ms ease, border-color 180ms ease" },
    cardHeader: { display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "flex-start", marginBottom: "16px" },
    cardTitle: { margin: 0, fontSize: "17px", color: isDark ? "#dbeafe" : "#1a3c5e" },
    helper: { margin: "6px 0 0", color: palette.muted, fontSize: "13px", lineHeight: 1.45 },
    emptyBox: { textAlign: "center", padding: "40px 20px", color: palette.empty },
    emptyIcon: { fontSize: "40px", marginBottom: "12px" },
    applyBtn: { padding: "10px 18px", background: canStartApplication ? palette.button : palette.disabled, color: canStartApplication ? "#fff" : isDark ? "#94a3b8" : "#6b7280", border: "none", borderRadius: "999px", fontSize: "14px", fontWeight: "700", cursor: canStartApplication ? "pointer" : "not-allowed", whiteSpace: "nowrap" },
    appRow: { padding: "16px 0", borderBottom: `1px solid ${palette.rowBorder}` },
    appRowTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px" },
    appInfo: { display: "flex", flexDirection: "column", gap: "4px" },
    appRole: { fontWeight: "600", fontSize: "14px", color: palette.text },
    appDate: { fontSize: "12px", color: palette.muted },
    appActions: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" },
    badge: { minHeight: "26px", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 12px", borderRadius: "999px", color: "#fff", fontSize: "12px", fontWeight: "700", lineHeight: 1, whiteSpace: "nowrap" },
    journeyButton: { minHeight: "26px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: `1px solid ${isDark ? "#31506e" : "#d7dde6"}`, background: palette.softCard, color: palette.text, borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: 700, lineHeight: 1, cursor: "pointer", whiteSpace: "nowrap" },
    journeyPanel: { background: palette.softCard, border: `1px solid ${palette.border}`, borderRadius: "10px", marginTop: "12px", padding: "14px", animation: "kw-applicant-journey-in 180ms ease both" },
    timeline: { borderLeft: `3px solid ${isDark ? "#31506e" : "#dbeafe"}`, listStyle: "none", margin: "12px 0 0", padding: "0 0 0 16px" },
    timelineItem: { marginBottom: "14px", position: "relative" },
    loading: { textAlign: "center", padding: "30px", color: palette.muted },
    error: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", padding: "12px 16px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" },
  };

  const handleStartApplication = () => {
    if (!canStartApplication) return;
    onStartApplication();
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>My Dashboard</h1>
          <p style={s.subtitle}>KeelWorks Volunteer Portal</p>
        </div>
        <div style={s.headerActions}>
          <button type="button" style={s.pillButton} onClick={toggleTheme}>
            {isDark ? "☀️ Light" : "🌙 Night"}
          </button>
          <button type="button" style={s.pillButton} onClick={() => setShowNotifications((current) => !current)}>
            🔔 Notifications
            {notifications.length > 0 && <span style={s.notificationCount}>{notifications.length}</span>}
          </button>
          {showNotifications && (
            <div style={s.notificationMenu}>
              <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>Recent updates</h3>
              {notifications.length === 0 ? (
                <p style={{ margin: 0, color: palette.muted, fontSize: "13px" }}>No realtime updates yet.</p>
              ) : notifications.map((item) => (
                <div key={item.id} style={s.notificationItem}>
                  <div>{item.message}</div>
                  <small style={{ color: palette.muted }}>{item.createdAt}</small>
                </div>
              ))}
            </div>
          )}
          <ProfileMenu name={user.full_name} onSignOut={onSignOut} dark={true} showDashboard={false} />
        </div>
      </div>

      <div style={s.body}>
        {error && <div style={s.error}>{error}</div>}

        <div style={s.card}>
          <div style={s.cardHeader}>
            <div>
              <h2 style={s.cardTitle}>My Applications</h2>
              <p style={s.helper}>{startApplicationHelp}</p>
            </div>
            <button
              type="button"
              style={s.applyBtn}
              onClick={handleStartApplication}
              disabled={!canStartApplication}
              title={startApplicationHelp}
            >
              Start New Application
            </button>
          </div>

          {loading ? (
            <div style={s.loading}>Loading your applications...</div>
          ) : applications.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={s.emptyIcon}>📋</div>
              <p>You have not applied for any position yet.</p>
            </div>
          ) : (
            <div>
              {applications.map((app) => {
                const expanded = expandedApplicationId === app.employee_id;
                const history = app.status_history || [];

                return (
                  <div key={app.employee_id} style={s.appRow}>
                    <div style={s.appRowTop}>
                      <div style={s.appInfo}>
                        <span style={s.appRole}>{app.interested_role || "Volunteer Application"}</span>
                        <span style={s.appDate}>
                          Applied on {app.application_date ? new Date(app.application_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"}
                        </span>
                      </div>
                      <div style={s.appActions}>
                        <span style={{ ...s.badge, background: STATUS_COLORS[app.application_status] || "#888" }}>
                          {app.application_status_label || STATUS_LABELS[app.application_status] || app.application_status}
                        </span>
                        <button
                          type="button"
                          style={s.journeyButton}
                          onClick={() => setExpandedApplicationId(expanded ? null : app.employee_id)}
                        >
                          {expanded ? "Hide journey" : "View journey"}
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div style={s.journeyPanel}>
                        <strong>Application journey</strong>
                        {history.length === 0 ? (
                          <p style={{ color: palette.muted, margin: "10px 0 0" }}>No status history has been recorded yet.</p>
                        ) : (
                          <ul style={s.timeline}>
                            {history.map((item) => (
                              <li key={item.history_id} style={s.timelineItem}>
                                <div style={{ fontWeight: 700 }}>
                                  {item.new_status_label || STATUS_LABELS[item.new_status] || item.new_status}
                                </div>
                                <div style={{ color: palette.muted, fontSize: "12px", marginTop: "3px" }}>
                                  {formatDateTime(item.created_at)}
                                </div>
                                {item.note && <p style={{ margin: "8px 0 0", color: palette.muted }}>{item.note}</p>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
