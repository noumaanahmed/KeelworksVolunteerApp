import React, { useState, useEffect, useCallback } from "react";
import ProfileMenu from "./ProfileMenu";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

const ApplicantDashboard = ({ user, token, onSignOut, onStartApplication }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/v1/apply/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setApplications(data.data.applications || []);
      } else {
        setError(data.error || "Failed to load your applications");
      }
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMyApplications(); }, [fetchMyApplications]);

  const statusColor = (s) => ({ Pending: "#f59e0b", Reviewing: "#3b82f6", Approved: "#10b981", Rejected: "#ef4444" }[s] || "#888");

  const s = {
    page: { minHeight: "100vh", background: "#f3f4f6", fontFamily: "Arial, sans-serif" },
    header: { background: "#1a3c5e", color: "#fff", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    title: { margin: "0 0 4px", fontSize: "22px" },
    subtitle: { margin: 0, fontSize: "13px", opacity: 0.75 },
    body: { maxWidth: "760px", margin: "32px auto", padding: "0 20px" },
    card: { background: "#fff", borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "24px", marginBottom: "20px" },
    cardTitle: { margin: "0 0 16px", fontSize: "17px", color: "#1a3c5e" },
    emptyBox: { textAlign: "center", padding: "40px 20px", color: "#666" },
    emptyIcon: { fontSize: "40px", marginBottom: "12px" },
    applyBtn: { marginTop: "16px", padding: "10px 22px", background: "#1a3c5e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
    appRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0f0" },
    appInfo: { display: "flex", flexDirection: "column", gap: "4px" },
    appRole: { fontWeight: "600", fontSize: "14px", color: "#222" },
    appDate: { fontSize: "12px", color: "#888" },
    badge: { padding: "4px 12px", borderRadius: "12px", color: "#fff", fontSize: "12px", fontWeight: "600" },
    loading: { textAlign: "center", padding: "30px", color: "#888" },
    error: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", padding: "12px 16px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>My Dashboard</h1>
          <p style={s.subtitle}>KeelWorks Volunteer Portal</p>
        </div>
        <ProfileMenu name={user.full_name} onSignOut={onSignOut} dark={true} showDashboard={false} />
      </div>

      <div style={s.body}>
        {error && <div style={s.error}>{error}</div>}

        <div style={s.card}>
          <h2 style={s.cardTitle}>My Applications</h2>

          {loading ? (
            <div style={s.loading}>Loading your applications...</div>
          ) : applications.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={s.emptyIcon}>📋</div>
              <p>You have not applied for any position yet.</p>
              <button style={s.applyBtn} onClick={onStartApplication}>Start an Application</button>
            </div>
          ) : (
            <div>
              {applications.map((app) => (
                <div key={app.employee_id} style={s.appRow}>
                  <div style={s.appInfo}>
                    <span style={s.appRole}>{app.interested_role || "Volunteer Application"}</span>
                    <span style={s.appDate}>
                      Applied on {app.application_date ? new Date(app.application_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"}
                    </span>
                  </div>
                  <span style={{ ...s.badge, background: statusColor(app.application_status) }}>
                    {app.application_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
