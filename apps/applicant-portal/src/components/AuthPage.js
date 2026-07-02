import React, { useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
} from "mdb-react-ui-kit";
import "../styles/auth-page.css";

import { API_BASE_URL } from "../config/api";

const getApiErrorMessage = (data) => {
  if (!data) return "Something went wrong";
  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.error === "string") return data.error;
  if (data.error?.code) return data.error.code;
  return "Something went wrong";
};

const AuthInput = ({ label, wrapperClassName = "mb-3", ...props }) => (
  <div className={`kw-auth-field kw-auth-floating-field ${wrapperClassName}`.trim()}>
    <input
      id={props.id || props.name}
      className="kw-auth-control kw-auth-floating-input"
      placeholder=" "
      aria-label={label}
      {...props}
    />
    <label className="kw-auth-floating-label" htmlFor={props.id || props.name}>
      {label}
    </label>
  </div>
);

const emptyForm = {
  email: "",
  password: "",
  confirm_password: "",
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

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const normalizedEmail = form.email.trim().toLowerCase();

    if (mode === "signup") {
      if (normalizedEmail.endsWith("@keelworks.org") || normalizedEmail.endsWith("@keelworks.com")) {
        setError("This email already belongs to an accepted KeelWorks employee. Please sign up with a personal email address.");
        setLoading(false);
        return;
      }

      if (form.password !== form.confirm_password) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
    }

    const endpoint = mode === "signin" ? "/api/v1/auth/signin" : "/api/v1/auth/signup";
    const body = mode === "signin"
      ? {
          email: normalizedEmail,
          password: form.password,
        }
      : {
          email: normalizedEmail,
          password: form.password,
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          role: "applicant",
        };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data));
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

  return (
    <MDBContainer fluid className="p-4 kw-auth-page kw-auth-gradient overflow-hidden">
      <MDBRow className="align-items-center min-vh-100 kw-auth-layout">
        <MDBCol
          md="6"
          className="text-center text-md-start d-flex flex-column justify-content-center kw-auth-copy-col"
        >
          <h1 className="my-5 display-3 fw-bold ls-tight px-3 kw-auth-title">
            KeelWorks Volunteer <br />
            <span className="kw-auth-title-highlight">Applicant Portal</span>
          </h1>

          <p className="px-3 kw-auth-description">
            Apply to volunteer with The KeelWorks Foundation, track your application,
            and continue your onboarding journey from one place.
          </p>
        </MDBCol>

        <MDBCol md="6" className="position-relative d-flex justify-content-center kw-auth-card-col">
          <div className="position-absolute rounded-circle shadow-5-strong kw-auth-shape-1" />
          <div className="position-absolute shadow-5-strong kw-auth-shape-2" />

          <MDBCard className={`my-5 kw-auth-glass kw-auth-glass--${mode}`}>
            <MDBCardBody className="kw-auth-card-body">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1 kw-auth-card-title">KeelWorks</h2>
                <p className="text-muted mb-0 kw-auth-card-subtitle">
                  {mode === "signin"
                    ? "Sign in to your applicant account"
                    : "Create your applicant account"}
                </p>
              </div>

              <form className="kw-auth-form" onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <>
                    <MDBRow>
                      <MDBCol md="6">
                        <AuthInput
                          label="First name"
                          name="first_name"
                          type="text"
                          value={form.first_name}
                          onChange={handleChange}
                          required
                        />
                      </MDBCol>

                      <MDBCol md="6">
                        <AuthInput
                          label="Middle name"
                          name="middle_name"
                          type="text"
                          value={form.middle_name}
                          onChange={handleChange}
                        />
                      </MDBCol>
                    </MDBRow>

                    <AuthInput
                      label="Last name"
                      name="last_name"
                      type="text"
                      value={form.last_name}
                      onChange={handleChange}
                      required
                    />
                  </>
                )}

                <AuthInput
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <AuthInput
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />

                {mode === "signup" && (
                  <AuthInput
                    label="Confirm password"
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                )}

                {error && <div className="kw-auth-error">{error}</div>}

                <MDBBtn
                  className="w-100 mb-4 kw-auth-submit"
                  size="md"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : mode === "signin"
                    ? "Sign In"
                    : "Create Applicant Account"}
                </MDBBtn>
              </form>

              <div className="kw-auth-switch">
                {mode === "signin" ? (
                  <>
                    New volunteer applicant?{" "}
                    <button
                      type="button"
                      className="kw-auth-link"
                      onClick={() => switchMode("signup")}
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="kw-auth-link"
                    onClick={() => switchMode("signin")}
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default AuthPage;
