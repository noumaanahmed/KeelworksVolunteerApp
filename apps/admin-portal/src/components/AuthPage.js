import React, { useState } from "react";
import "../styles/auth-page.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

const getApiErrorMessage = (data) => {
  if (!data) return "Something went wrong";
  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.error === "string") return data.error;
  if (data.error?.code) return data.error.code;
  return "Something went wrong";
};

const emptyForm = {
  email: "",
  password: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  admin_secret: "",
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

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "signin" ? "/api/v1/auth/signin" : "/api/v1/auth/signup";
    const body = mode === "signin"
      ? { email: form.email, password: form.password }
      : {
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          role: "admin",
          admin_secret: form.admin_secret,
        };

    try {
      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data));
      }

      if (data.data.user.role !== "admin") {
        throw new Error("This portal is only for admin accounts.");
      }

      onAuthSuccess(data.data.user, data.data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h2>KeelWorks</h2>
          <p>Admin Management Portal</p>
        </div>

        <h3 className="auth-heading">
          {mode === "signin" ? "Admin Sign In" : "Create Admin Account"}
        </h3>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="auth-row">
                <div className="auth-field">
                  <label>First Name *</label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Jane"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>Middle Name</label>
                  <input
                    name="middle_name"
                    value={form.middle_name}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Last Name *</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="auth-field">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {mode === "signup" && (
            <div className="auth-field">
              <label>Admin Secret Key *</label>
              <input
                type="password"
                name="admin_secret"
                value={form.admin_secret}
                onChange={handleChange}
                placeholder="Contact your administrator"
                required
              />
              <small className="auth-hint">Required to create an admin account.</small>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Admin Account"}
          </button>
        </form>

        <p className="auth-footer">
          {mode === "signin" ? (
            <>
              Need an admin account?{" "}
              <span className="auth-link" onClick={() => switchMode("signup")}>Create one</span>
            </>
          ) : (
            <span className="auth-link" onClick={() => switchMode("signin")}>Back to Admin Sign In</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
