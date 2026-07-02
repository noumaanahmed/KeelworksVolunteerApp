import React, { useState, useEffect, useRef } from "react";

import { API_BASE_URL } from "../config/api";

const FIELD_LABELS = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email address",
  phoneNumber: "Phone number",
  phoneType: "Phone type",
  addressLine1: "Address Line 1",
  homeCountry: "Home Country",
  state: "State / Province",
  cityName: "City",
  zipcode: "Zipcode",
  timezone: "Time zone",
};

const PersonalInformation = ({ handleNextButton, handleFormChange, initialData = {}, countries = [], authUser = null }) => {
  const lockedProfileFields = Boolean(authUser);
  const [personalData, setPersonalData] = useState({
    firstName: initialData.firstName || authUser?.first_name || "",
    middleName: initialData.middleName || authUser?.middle_name || "",
    lastName: initialData.lastName || authUser?.last_name || "",
    email: initialData.email || authUser?.email || "",
    phoneNumber: initialData.phoneNumber || "",
    phoneType: initialData.phoneType || "",
    addressLine1: initialData.addressLine1 || "",
    addressLine2: initialData.addressLine2 || "",
    homeCountry: initialData.homeCountry || "",
    state: initialData.state || "",
    cityName: initialData.cityName || "",
    cityId: initialData.cityId || "free-text",
    zipcode: initialData.zipcode || "",
    timezone: initialData.timezone || "",
  });

  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const prevCountry = useRef(null);

  // errors: { fieldName: "message" }. touched: fields the user has interacted with.
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (prevCountry.current === personalData.homeCountry) return;
    prevCountry.current = personalData.homeCountry;
    setStates([]);
    if (!personalData.homeCountry) return;
    const countryObj = countries.find(c => String(c.country_id) === String(personalData.homeCountry));
    if (!countryObj?.country_code) return;
    setStatesLoading(true);
    fetch(`${API_BASE_URL}/api/v1/locations/states/${countryObj.country_code}`)
      .then(r => r.json())
      .then(d => setStates(d.data || []))
      .catch(() => setStates([]))
      .finally(() => setStatesLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalData.homeCountry, countries]);

  // Validate a single field. Returns an error string or "" if valid.
  const validateField = (name, data) => {
    const v = data[name];
    switch (name) {
      case "firstName":
        if (!v || !v.trim()) return "First name is required.";
        if (!/^[a-zA-Z\s'-]+$/.test(v.trim())) return "First name can only contain letters, spaces, hyphens, or apostrophes.";
        return "";
      case "lastName":
        if (!v || !v.trim()) return "Last name is required.";
        if (!/^[a-zA-Z\s'-]+$/.test(v.trim())) return "Last name can only contain letters, spaces, hyphens, or apostrophes.";
        return "";
      case "email":
        if (!v || !v.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Please enter a valid email address.";
        return "";
      case "phoneNumber":
        if (!v || !v.trim()) return "Phone number is required.";
        if (!/^\d{10}$/.test(v.replace(/\D/g, ""))) return "Phone number must be exactly 10 digits.";
        return "";
      case "phoneType":
        if (!v) return "Please select a phone type.";
        return "";
      case "addressLine1":
        if (!v || !v.trim()) return "Address Line 1 is required.";
        return "";
      case "homeCountry":
        if (!v) return "Please select a home country.";
        return "";
      case "state":
        if (!v) return "Please select a state / province.";
        return "";
      case "cityName":
        if (!v || !v.trim()) return "Please enter your city.";
        return "";
      case "zipcode":
        if (!v || !v.trim()) return "Zipcode is required.";
        if (v.trim().length > 12) return "Zipcode looks too long. Please check it.";
        return "";
      case "timezone":
        if (!v) return "Please select your time zone.";
        return "";
      default:
        return "";
    }
  };

  const validateAll = (data) => {
    const newErrors = {};
    Object.keys(FIELD_LABELS).forEach((name) => {
      const msg = validateField(name, data);
      if (msg) newErrors[name] = msg;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...personalData };
    if (name === "homeCountry") {
      updated = { ...updated, homeCountry: value ? Number(value) : "", state: "", cityName: "", cityId: "free-text" };
    } else if (name === "state") {
      updated = { ...updated, state: value ? Number(value) : "", cityName: "", cityId: "free-text" };
    } else if (name === "cityName") {
      updated = { ...updated, cityName: value, cityId: "free-text" };
    } else {
      updated = { ...updated, [name]: value };
    }
    setPersonalData(updated);
    handleFormChange(updated);

    // Re-validate this field live, and any dependent field already touched.
    setErrors((prev) => {
      const next = { ...prev };
      const msg = validateField(name, updated);
      if (msg) next[name] = msg; else delete next[name];
      return next;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => {
      const next = { ...prev };
      const msg = validateField(name, personalData);
      if (msg) next[name] = msg; else delete next[name];
      return next;
    });
  };

  const showError = (name) => (touched[name] || submitAttempted) && errors[name];

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = validateAll(personalData);
    setErrors(allErrors);
    setSubmitAttempted(true);
    setTouched(
      Object.keys(FIELD_LABELS).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );

    if (Object.keys(allErrors).length === 0) {
      handleNextButton();
    } else {
      // Scroll the summary box into view
      document.getElementById("personal-info-error-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const errorList = Object.entries(errors);

  return (
    <div className="form-container">
      <h5>Step 1: Add your personal details below</h5>

      {submitAttempted && errorList.length > 0 && (
        <div className="error-summary" id="personal-info-error-summary">
          <div className="error-summary-title">
            Please fix the following {errorList.length === 1 ? "issue" : `${errorList.length} issues`}:
          </div>
          <ul className="error-summary-list">
            {errorList.map(([field, msg]) => (
              <li key={field}>{FIELD_LABELS[field] || field}: {msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="personal-details-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First name<span className="requiredLabel">*</span></label>
            <input
              type="text" id="firstName" name="firstName"
              className={`${showError("firstName") ? "input-invalid" : ""} ${lockedProfileFields ? "input-readonly" : ""}`.trim()}
              value={personalData.firstName} onChange={handleChange} onBlur={handleBlur}
              disabled={lockedProfileFields}
            />
            {showError("firstName") && <span className="field-error">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="middleName">Middle name (optional)</label>
            <input type="text" id="middleName" name="middleName" className={lockedProfileFields ? "input-readonly" : ""} value={personalData.middleName} onChange={handleChange} disabled={lockedProfileFields} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last name<span className="requiredLabel">*</span></label>
          <input
            type="text" id="lastName" name="lastName"
            className={`${showError("lastName") ? "input-invalid" : ""} ${lockedProfileFields ? "input-readonly" : ""}`.trim()}
            value={personalData.lastName} onChange={handleChange} onBlur={handleBlur}
            disabled={lockedProfileFields}
          />
          {showError("lastName") && <span className="field-error">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address<span className="requiredLabel">*</span></label>
          <input
            type="email" id="email" name="email"
            className={`${showError("email") ? "input-invalid" : ""} ${lockedProfileFields ? "input-readonly" : ""}`.trim()}
            value={personalData.email} onChange={handleChange} onBlur={handleBlur}
            disabled={lockedProfileFields}
          />
          {showError("email") && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone number<span className="requiredLabel">*</span></label>
            <input
              type="tel" id="phoneNumber" name="phoneNumber"
              className={showError("phoneNumber") ? "input-invalid" : ""}
              value={personalData.phoneNumber} onChange={handleChange} onBlur={handleBlur}
              placeholder="10 digit number"
            />
            {showError("phoneNumber") && <span className="field-error">{errors.phoneNumber}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="phoneType">Phone Type<span className="requiredLabel">*</span></label>
            <select
              id="phoneType" name="phoneType"
              className={showError("phoneType") ? "input-invalid" : ""}
              value={personalData.phoneType} onChange={handleChange} onBlur={handleBlur}
            >
              <option value="">Please select</option>
              <option value="Mobile">Mobile</option>
              <option value="Home">Home</option>
              <option value="Work">Work</option>
            </select>
            {showError("phoneType") && <span className="field-error">{errors.phoneType}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="addressLine1">Address Line 1<span className="requiredLabel">*</span></label>
          <input
            type="text" id="addressLine1" name="addressLine1"
            className={showError("addressLine1") ? "input-invalid" : ""}
            value={personalData.addressLine1} onChange={handleChange} onBlur={handleBlur}
          />
          {showError("addressLine1") && <span className="field-error">{errors.addressLine1}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="addressLine2">Address Line 2 (optional)</label>
          <input type="text" id="addressLine2" name="addressLine2" placeholder="Apartment, suite, etc." value={personalData.addressLine2} onChange={handleChange} />
        </div>

        {/* COUNTRY */}
        <div className="form-group">
          <label htmlFor="homeCountry">Home Country<span className="requiredLabel">*</span></label>
          <select
            id="homeCountry" name="homeCountry"
            className={showError("homeCountry") ? "input-invalid" : ""}
            value={personalData.homeCountry} onChange={handleChange} onBlur={handleBlur}
          >
            <option value="">Please select a country</option>
            {countries.map(c => <option key={c.country_id} value={c.country_id}>{c.country_name}</option>)}
          </select>
          {showError("homeCountry") && <span className="field-error">{errors.homeCountry}</span>}
        </div>

        {/* STATE */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="state">State / Province<span className="requiredLabel">*</span></label>
            <select
              id="state" name="state"
              className={showError("state") ? "input-invalid" : ""}
              value={personalData.state} onChange={handleChange} onBlur={handleBlur}
              disabled={!personalData.homeCountry}
            >
              <option value="">
                {!personalData.homeCountry ? "Select country first" : statesLoading ? "Loading..." : states.length === 0 ? "No states available" : "Select a state"}
              </option>
              {states.map(s => <option key={s.state_id} value={s.state_id}>{s.state_name}</option>)}
            </select>
            {showError("state") && <span className="field-error">{errors.state}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="zipcode">Zipcode<span className="requiredLabel">*</span></label>
            <input
              type="text" id="zipcode" name="zipcode"
              className={showError("zipcode") ? "input-invalid" : ""}
              value={personalData.zipcode} onChange={handleChange} onBlur={handleBlur}
            />
            {showError("zipcode") && <span className="field-error">{errors.zipcode}</span>}
          </div>
        </div>

        {/* CITY - free text */}
        <div className="form-group">
          <label htmlFor="cityName">City<span className="requiredLabel">*</span></label>
          <input
            type="text" id="cityName" name="cityName"
            className={showError("cityName") ? "input-invalid" : ""}
            value={personalData.cityName} onChange={handleChange} onBlur={handleBlur}
            placeholder={!personalData.state ? "Select state first" : "Enter your city"}
          />
          {showError("cityName") && <span className="field-error">{errors.cityName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Time zone<span className="requiredLabel">*</span></label>
          <select
            id="timezone" name="timezone"
            className={showError("timezone") ? "input-invalid" : ""}
            value={personalData.timezone} onChange={handleChange} onBlur={handleBlur}
          >
            <option value="">Please select</option>
            <option value="edt">EDT (Eastern Daylight)</option>
            <option value="est">EST (Eastern Standard)</option>
            <option value="cdt">CDT (Central Daylight)</option>
            <option value="cst">CST (Central Standard)</option>
            <option value="mdt">MDT (Mountain Daylight)</option>
            <option value="mst">MST (Mountain Standard)</option>
            <option value="pdt">PDT (Pacific Daylight)</option>
            <option value="pst">PST (Pacific Standard)</option>
            <option value="akdt">AKDT (Alaska)</option>
            <option value="hst">HST (Hawaii)</option>
            <option value="gmt">GMT</option>
            <option value="bst">BST (British Summer)</option>
            <option value="cet">CET (Central European)</option>
            <option value="cst-asia">CST (China Standard)</option>
            <option value="jst">JST (Japan)</option>
            <option value="aest">AEST (Australian Eastern)</option>
            <option value="awst">AWST (Australian Western)</option>
          </select>
          {showError("timezone") && <span className="field-error">{errors.timezone}</span>}
        </div>

        <div className="form-group">
          <button type="submit" className="submit-button">Next</button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformation;
