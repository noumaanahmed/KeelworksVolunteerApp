import React, { useState, useEffect } from "react";
import "./styles/app.css";
import VerticalStepper from "./components/VerticalStepper";
import PersonalInformation from "./components/PersonalInformation";
import EducationAndExperience from "./components/EducationAndExperience";
import RoleAndAvailability from "./components/RoleAndAvailability";
import AdditionalInformation from "./components/AdditionalInformation";
import Identification from "./components/Identification";
import AuthPage from "./components/AuthPage";
import ApplicantDashboard from "./components/ApplicantDashboard";
import ThankYouPage from "./components/ThankYouPage";
import ProfileMenu from "@keelworks/shared-ui/ProfileMenu";
import HeaderBackgroundImage from "./Assets/nav_background1.jpg";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

// Applicant-side views
const VIEW_DASHBOARD = "dashboard";
const VIEW_FORM = "form";
const VIEW_THANK_YOU = "thank_you";

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [applicantView, setApplicantView] = useState(VIEW_DASHBOARD);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    personalInformation: {},
    educationAndExperience: {},
    roleAndAvailability: {},
    additionalInformation: {},
    identification: {},
  });

  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("kw_volunteer_token");
    const user = localStorage.getItem("kw_volunteer_user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);

        if (parsedUser.role === "applicant") {
          setAuthToken(token);
          setAuthUser(parsedUser);
        } else {
          localStorage.removeItem("kw_volunteer_token");
          localStorage.removeItem("kw_volunteer_user");
        }
      } catch {
        localStorage.removeItem("kw_volunteer_token");
        localStorage.removeItem("kw_volunteer_user");
      }
    }

    setAuthChecked(true);
  }, []);

  // Pressing the browser Back button while logged in signs the user out
  // and returns them to the Sign In page.
  useEffect(() => {
    const handlePopState = () => {
      const stillLoggedIn = localStorage.getItem("kw_volunteer_token");

      if (stillLoggedIn) {
        localStorage.removeItem("kw_volunteer_token");
        localStorage.removeItem("kw_volunteer_user");
        setAuthUser(null);
        setAuthToken(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/v1/locations/countries`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) setCountries(data.data);
      })
      .catch(() => setCountries([]));
  }, []);

  const handleAuthSuccess = (user, token) => {
    if (user.role !== "applicant") {
      alert(
        "This portal is only for volunteers/applicants. Please use the admin portal."
      );
      return;
    }

    localStorage.setItem("kw_volunteer_token", token);
    localStorage.setItem("kw_volunteer_user", JSON.stringify(user));

    setAuthUser(user);
    setAuthToken(token);
    setApplicantView(VIEW_DASHBOARD);

    // Push a new history entry so the browser Back button has somewhere
    // to go instead of leaving the site.
    window.history.pushState({ loggedIn: true }, "", window.location.pathname);
  };

  const handleSignOut = () => {
    localStorage.removeItem("kw_volunteer_token");
    localStorage.removeItem("kw_volunteer_user");

    setAuthUser(null);
    setAuthToken(null);
    setApplicantView(VIEW_DASHBOARD);
    setStep(1);

    setFormData({
      personalInformation: {},
      educationAndExperience: {},
      roleAndAvailability: {},
      additionalInformation: {},
      identification: {},
    });
  };

  const handleStartApplication = () => {
    setStep(1);
    setApplicantView(VIEW_FORM);
  };

  const handleReturnHomeFromThankYou = () => {
    // "Return to home" after a successful application takes the user back
    // to the Sign In page, signing them out in the process.
    handleSignOut();
  };

  const handleFormChange = (stepName, data) => {
    setFormData((prev) => ({ ...prev, [stepName]: data }));
  };

  const handleNextButton = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBackButton = () => {
    if (step > 1) setStep(step - 1);
  };

  // Resolve the typed city name into a real city_id.
  // Looks up existing cities for the chosen state; creates a new one if not found.
  const resolveCityId = async (stateId, cityName) => {
    const trimmed = (cityName || "").trim();
    if (!stateId || !trimmed) return null;

    try {
      const citiesRes = await fetch(`${API}/api/v1/locations/cities/${stateId}`);

      if (citiesRes.ok) {
        const citiesJson = await citiesRes.json();
        const match = (citiesJson.data || []).find(
          (c) => c.city_name.toLowerCase() === trimmed.toLowerCase()
        );

        if (match) return match.city_id;
      }
    } catch (err) {
      console.error("City lookup failed", err);
    }

    try {
      const createRes = await fetch(`${API}/api/v1/locations/cities/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state_id: stateId, city_name: trimmed }),
      });

      if (createRes.ok) {
        const createJson = await createRes.json();
        return createJson.data.city_id;
      }
    } catch (err) {
      console.error("City create failed", err);
    }

    return null;
  };

  // Converts "MM/YYYY" into "YYYY-MM-01" for backend date validators.
  const monthYearToISO = (mmYYYY) => {
    if (!mmYYYY) return null;

    const match = /^(\d{2})\/(\d{4})$/.exec(mmYYYY.trim());
    if (!match) return null;

    const [, mm, yyyy] = match;
    return `${yyyy}-${mm}-01`;
  };

  // Maps the multi-step form's field names to what the backend expects.
  const buildApplicationPayload = (data, cityId) => {
    const personal = data.personalInformation || {};
    const role = data.roleAndAvailability || {};
    const additional = data.additionalInformation || {};
    const identification = data.identification || {};
    const edu = data.educationAndExperience || {};

    const visaStatus =
      role.visaStatus === "Other"
        ? role.visaOther || "Other"
        : role.visaStatus || "";

    const educations = (edu.education || []).map((e) => ({
      institution_name: e.school || "",
      degree: e.degree || "",
      major: e.fieldOfStudy || "",
      start_date: monthYearToISO(e.eduStartDate),
      end_date: monthYearToISO(e.eduEndDate),
    }));

    const employments = (edu.experiences || []).map((e) => ({
      company_name: e.company || "",
      job_title: e.jobTitle || "",
      location: e.location || "",
      start_date: monthYearToISO(e.startDate),
      end_date: monthYearToISO(e.endDate),
      responsibilities: e.responsibilities || "",
    }));

    return {
      // personal details
      first_name: personal.firstName || "",
      middle_name: personal.middleName || "",
      last_name: personal.lastName || "",
      personal_email: personal.email || "",
      phone: personal.phoneNumber || "",
      phonetype: personal.phoneType || "",
      linkedin_url: edu.additionalInformation?.linkedinProfile || "",
      additional_websites: edu.additionalInformation?.additionalWebsite || "",
      additional_info: additional.additionalInfo || "",

      // address
      address_line_1: personal.addressLine1 || "",
      address_line_2: personal.addressLine2 || "",
      city_id: cityId,
      zip_code: personal.zipcode || "",
      country_id: personal.homeCountry || null,

      // KeelWorks-specific backend field names
      why_kworks: additional.interestReason || "",
      interested_role:
        role.interestedRole === "Other"
          ? role.otherRole || "Other"
          : role.interestedRole || "",
      hours_commitment: role.hoursAvailable
        ? Number(role.hoursAvailable)
        : null,
      start_date: role.desiredStartDate || "",

      // enums / extra profile fields
      visa_status: visaStatus,
      gender: identification.gender || "",
      opt_support: role.optSupport || "",
      time_zone: personal.timezone || "",

      // EEO data
      sexual_orientation: identification.sexualOrientation || "",
      disability: identification.disability || "",

      // education / employment history
      educations,
      employments,
    };
  };

  const handleFormSubmit = async (data) => {
    const finalData = { ...formData, identification: data };
    setFormData(finalData);

    const personal = finalData.personalInformation || {};

    const cityId = await resolveCityId(personal.state, personal.cityName);

    if (!cityId) {
      alert(
        "We couldn't save your city. Please check your State and City fields and try again."
      );
      return;
    }

    const payload = buildApplicationPayload(finalData, cityId);

    try {
      const res = await fetch(`${API}/api/v1/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        let errMsg = "Submission failed";

        if (errJson) {
          const errObj = errJson.error;

          if (errObj && Array.isArray(errObj.details)) {
            errMsg = errObj.details
              .map((d) => d.message || `${d.field}: invalid value`)
              .join("; ");
          } else if (typeof errObj === "string") {
            errMsg = errObj;
          } else if (
            typeof errJson.message === "string" &&
            errJson.message !== "Validation error"
          ) {
            errMsg = errJson.message;
          } else if (errObj) {
            errMsg = JSON.stringify(errObj);
          } else if (errJson.message) {
            errMsg = errJson.message;
          }
        }

        throw new Error(errMsg);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert(
        `Unable to submit your application: ${
          error.message || "Please try again."
        }`
      );
      return;
    }

    const email = finalData.personalInformation?.email;
    const name = [
      finalData.personalInformation?.firstName,
      finalData.personalInformation?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    if (email) {
      try {
        await fetch(`${API}/api/v1/applications/confirmation-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ email, name }),
        });
      } catch (err) {
        console.error("Confirmation email failed:", err);
      }
    }

    // Show the in-app Thank You screen instead of an alert/static page.
    setApplicantView(VIEW_THANK_YOU);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <PersonalInformation
            handleNextButton={handleNextButton}
            handleFormChange={(d) =>
              handleFormChange("personalInformation", d)
            }
            initialData={formData.personalInformation}
            countries={countries}
            authUser={authUser}
          />
        );

      case 2:
        return (
          <EducationAndExperience
            handleNextButton={handleNextButton}
            handleBackButton={handleBackButton}
            handleFormChange={(d) =>
              handleFormChange("educationAndExperience", d)
            }
            initialData={formData.educationAndExperience}
          />
        );

      case 3:
        return (
          <RoleAndAvailability
            handleNextButton={handleNextButton}
            handleBackButton={handleBackButton}
            handleFormChange={(d) =>
              handleFormChange("roleAndAvailability", d)
            }
            initialData={formData.roleAndAvailability}
          />
        );

      case 4:
        return (
          <AdditionalInformation
            handleNextButton={handleNextButton}
            handleBackButton={handleBackButton}
            handleFormChange={(d) =>
              handleFormChange("additionalInformation", d)
            }
            initialData={formData.additionalInformation}
          />
        );

      case 5:
        return (
          <Identification
            handleBackButton={handleBackButton}
            handleFormChange={(d) => handleFormChange("identification", d)}
            handleFormSubmit={handleFormSubmit}
            initialData={formData.identification}
          />
        );

      default:
        return null;
    }
  };

  if (!authChecked) return null;

  if (!authUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (authUser.role !== "applicant") {
    handleSignOut();
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // ===== Applicant side =====

  if (applicantView === VIEW_THANK_YOU) {
    return <ThankYouPage onReturnHome={handleReturnHomeFromThankYou} />;
  }

  if (applicantView === VIEW_DASHBOARD) {
    return (
      <ApplicantDashboard
        user={authUser}
        token={authToken}
        onSignOut={handleSignOut}
        onStartApplication={handleStartApplication}
      />
    );
  }

  // applicantView === VIEW_FORM
  return (
    <div className="container">
      <header className="header">
        <div className="headerText">
          <h1>KeelWorks Volunteer Sign Up</h1>
          <p>
            Join our dedicated team of volunteers and make a lasting impact in
            our community.
          </p>
        </div>

        <div style={{ position: "absolute", top: "16px", right: "20px" }}>
          <ProfileMenu
            name={authUser.full_name}
            onSignOut={handleSignOut}
            dark={true}
            showDashboard={true}
            onDashboard={() => setApplicantView(VIEW_DASHBOARD)}
          />
        </div>

        <img
          className="headerBgImg"
          src={HeaderBackgroundImage}
          alt="Keelworks"
        />
      </header>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ marginRight: "40px", marginTop: "55px" }}>
            <VerticalStepper step={step} />
          </div>

          <div
            style={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}