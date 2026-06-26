import React, { useState } from "react";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

const emptyForm = {
  email: "",
  password: "",
  first_name: "",
  middle_name: "",
  last_name: "",
};

const AuthPage = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint =
      mode === "signin" ? "/api/v1/auth/signin" : "/api/v1/auth/signup";

    const body =
      mode === "signin"
        ? {
            email: form.email,
            password: form.password,
          }
        : {
            email: form.email,
            password: form.password,
            first_name: form.first_name,
            middle_name: form.middle_name,
            last_name: form.last_name,
            role: "applicant",
          };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.data.user.role !== "applicant") {
        throw new Error(
          "This portal is only for volunteer/applicant accounts. Please use the admin portal."
        );
      }

      localStorage.setItem("kw_volunteer_token", data.data.token);
      localStorage.setItem("kw_volunteer_user", JSON.stringify(data.data.user));

      onAuthSuccess(data.data.user, data.data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    overlay: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a3c5e 0%, #2d6a9f 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    },
    card: {
      background: "#fff",
      borderRadius: "12px",
      padding: "40px",
      width: "100%",
      maxWidth: "440px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },
    logoArea: {
      textAlign: "center",
      marginBottom: "24px",
    },
    logo: {
      color: "#1a3c5e",
      margin: "0 0 4px",
      fontSize: "28px",
      fontWeight: "bold",
    },
    tagline: {
      color: "#666",
      margin: 0,
      fontSize: "14px",
    },
    heading: {
      textAlign: "center",
      color: "#1a3c5e",
      fontSize: "18px",
      fontWeight: "600",
      margin: "0 0 20px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    row: {
      display: "flex",
      gap: "12px",
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      flex: 1,
    },
    label: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#333",
    },
    input: {
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "14px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    error: {
      background: "#fff0f0",
      border: "1px solid #ffcccc",
      color: "#cc0000",
      padding: "10px 12px",
      borderRadius: "6px",
      fontSize: "13px",
    },
    btn: {
      padding: "12px",
      background: "#1a3c5e",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "4px",
    },
    btnDisabled: {
      padding: "12px",
      background: "#aaa",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      fontSize: "15px",
      cursor: "not-allowed",
      marginTop: "4px",
    },
    footer: {
      textAlign: "center",
      marginTop: "16px",
      fontSize: "13px",
      color: "#666",
    },
    link: {
      color: "#2d6a9f",
      cursor: "pointer",
      fontWeight: "600",
      textDecoration: "underline",
    },
    backLink: {
      color: "#2d6a9f",
      cursor: "pointer",
      fontWeight: "600",
      textDecoration: "underline",
      fontSize: "13px",
    },
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.logoArea}>
          <h2 style={s.logo}>KeelWorks</h2>
          <p style={s.tagline}>Volunteer Applicant Portal</p>
        </div>

        <h3 style={s.heading}>
          {mode === "signin"
            ? "Volunteer Applicant Sign In"
            : "Create Volunteer Applicant Account"}
        </h3>

        <form onSubmit={handleSubmit} style={s.form}>
          {mode === "signup" && (
            <>
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>First Name *</label>
                  <input
                    style={s.input}
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Jane"
                    required
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Middle Name</label>
                  <input
                    style={s.input}
                    name="middle_name"
                    value={form.middle_name}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Last Name *</label>
                <input
                  style={s.input}
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </>
          )}

          <div style={s.field}>
            <label style={s.label}>Email Address *</label>
            <input
              style={s.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password *</label>
            <input
              style={s.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button
            type="submit"
            style={loading ? s.btnDisabled : s.btn}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign In"
              : "Create Volunteer Applicant Account"}
          </button>
        </form>

        <p style={s.footer}>
          {mode === "signin" ? (
            <>
              New volunteer applicant?{" "}
              <span style={s.link} onClick={() => switchMode("signup")}>
                Create an account
              </span>
            </>
          ) : (
            <span style={s.backLink} onClick={() => switchMode("signin")}>
              Back to Sign In
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;