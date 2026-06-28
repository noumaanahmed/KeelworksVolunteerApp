import React, { useState, useEffect, useCallback } from "react";
import ProfileMenu from "@keelworks/shared-ui/ProfileMenu";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

const getApiErrorMessage = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.error === "string") return data.error;
  if (data.error?.code) return data.error.code;
  return fallback;
};

const AdminDashboard = ({ user, token, onSignOut }) => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, current_page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const fetchApplications = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/v1/applications/admin?page=${p}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setApplications(data.data.applications || []);
        setPagination(data.data.pagination || {});
      } else {
        setError(getApiErrorMessage(data, "Failed to load applications"));
      }
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchApplications(page); }, [page, fetchApplications]);

  const statusColor = (s) => ({ Pending: "#f59e0b", Reviewing: "#3b82f6", Approved: "#10b981", Rejected: "#ef4444" }[s] || "#888");

  const st = {
    page: { minHeight: "100vh", background: "#f3f4f6", fontFamily: "Arial, sans-serif" },
    header: { background: "#1a3c5e", color: "#fff", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    title: { margin: "0 0 4px", fontSize: "22px" },
    subtitle: { margin: 0, fontSize: "13px", opacity: 0.75 },
    userArea: { display: "flex", alignItems: "center", gap: "12px" },
    statsBar: { display: "flex", gap: "16px", padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e5e7eb" },
    stat: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, padding: "12px", background: "#f9fafb", borderRadius: "8px" },
    statNum: { fontSize: "28px", fontWeight: "bold", color: "#1a3c5e" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "2px" },
    tableWrap: { margin: "24px 32px", background: "#fff", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#1a3c5e" },
    th: { padding: "12px 16px", color: "#fff", textAlign: "left", fontSize: "13px", fontWeight: "600" },
    td: { padding: "12px 16px", fontSize: "13px", color: "#333" },
    badge: { padding: "3px 10px", borderRadius: "12px", color: "#fff", fontSize: "11px", fontWeight: "600" },
    viewBtn: { padding: "5px 12px", background: "#2d6a9f", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
    pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", padding: "16px" },
    pageBtn: { padding: "7px 16px", background: "#1a3c5e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
    pageInfo: { fontSize: "13px", color: "#555" },
    loading: { padding: "40px", textAlign: "center", color: "#888" },
    empty: { padding: "40px", textAlign: "center", color: "#888" },
    error: { margin: "16px 32px", padding: "12px 16px", background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", borderRadius: "6px", fontSize: "13px" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
    modal: { background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "580px", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" },
    modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #eee", background: "#1a3c5e" },
    modalTitle: { margin: 0, color: "#fff", fontSize: "16px" },
    closeBtn: { background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer" },
    modalBody: { padding: "16px 20px", overflowY: "auto" },
    row: { display: "flex", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: "13px" },
    rowLabel: { fontWeight: "600", color: "#555", width: "150px", flexShrink: 0 },
    rowValue: { color: "#333", flex: 1, wordBreak: "break-word" },
  };

  return (
    <div style={st.page}>
      <div style={st.header}>
        <div>
          <h1 style={st.title}>Admin Dashboard</h1>
          <p style={st.subtitle}>KeelWorks Volunteer Applications</p>
        </div>
        <div style={st.userArea}>
          <ProfileMenu name={user.full_name} onSignOut={onSignOut} dark={true} />
        </div>
      </div>

      <div style={st.statsBar}>
        <div style={st.stat}><span style={st.statNum}>{pagination.total || 0}</span><span style={st.statLabel}>Total</span></div>
        <div style={st.stat}><span style={st.statNum}>{applications.filter(a => a.application_status === "Pending").length}</span><span style={st.statLabel}>Pending</span></div>
        <div style={st.stat}><span style={st.statNum}>{applications.filter(a => a.application_status === "Approved").length}</span><span style={st.statLabel}>Approved</span></div>
        <div style={st.stat}><span style={st.statNum}>{applications.filter(a => a.application_status === "Rejected").length}</span><span style={st.statLabel}>Rejected</span></div>
      </div>

      {error && <div style={st.error}>{error}</div>}

      <div style={st.tableWrap}>
        {loading ? <div style={st.loading}>Loading applications...</div> : applications.length === 0 ? <div style={st.empty}>No applications found.</div> : (
          <table style={st.table}>
            <thead>
              <tr style={st.thead}>
                {["ID", "Name", "Email", "Phone", "Status", "Applied", "Actions"].map(h => <th key={h} style={st.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {applications.map((a, i) => (
                <tr key={a.employee_id} style={{ borderBottom: "1px solid #e5e7eb", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                  <td style={st.td}>#{a.employee_id}</td>
                  <td style={st.td}>{a.first_name} {a.last_name}</td>
                  <td style={st.td}>{a.personal_email}</td>
                  <td style={st.td}>{a.phone}</td>
                  <td style={st.td}><span style={{ ...st.badge, background: statusColor(a.application_status) }}>{a.application_status}</span></td>
                  <td style={st.td}>{a.application_date ? new Date(a.application_date).toLocaleDateString() : "—"}</td>
                  <td style={st.td}><button style={st.viewBtn} onClick={() => setSelected(a)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.total_pages > 1 && (
        <div style={st.pagination}>
          <button style={st.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={st.pageInfo}>Page {pagination.current_page} of {pagination.total_pages}</span>
          <button style={st.pageBtn} disabled={page >= pagination.total_pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {selected && (
        <div style={st.modalOverlay} onClick={() => setSelected(null)}>
          <div style={st.modal} onClick={e => e.stopPropagation()}>
            <div style={st.modalHeader}>
              <h2 style={st.modalTitle}>Application #{selected.employee_id}</h2>
              <button style={st.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={st.modalBody}>
              {[
                ["Full Name", `${selected.first_name} ${selected.middle_name || ""} ${selected.last_name}`],
                ["Email", selected.personal_email],
                ["Phone", `${selected.phone} (${selected.phonetype})`],
                ["Gender", selected.gender],
                ["Time Zone", selected.time_zone],
                ["Visa Status", selected.visa_status],
                ["OPT Support", selected.opt_support],
                ["Hours Commitment", selected.hours_commitment],
                ["Start Date", selected.start_date ? new Date(selected.start_date).toLocaleDateString() : "—"],
                ["Status", selected.application_status],
                ["LinkedIn", selected.linkedin_url || "—"],
                ["Additional Sites", selected.additional_websites || "—"],
                ["Why KeelWorks", selected.why_kworks || "—"],
                ["Additional Info", selected.additional_info || "—"],
              ].map(([label, value]) => (
                <div key={label} style={st.row}>
                  <span style={st.rowLabel}>{label}</span>
                  <span style={st.rowValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;