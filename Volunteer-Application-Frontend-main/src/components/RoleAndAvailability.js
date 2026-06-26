import React, { useState, useEffect } from 'react';

const FIELD_LABELS = {
  interestedRole: 'Interested role',
  willingDifferentRole: 'Willingness to take a different role',
  skillsExperience: 'Skills and experience',
  hoursAvailable: 'Hours available weekly',
  visaStatus: 'Visa status',
  visaOther: 'Visa status (specify)',
  optSupport: 'OPT support',
  desiredStartDate: 'Desired start date',
  otherRole: 'Other role (specify)',
};

const RoleAndAvailability = ({ handleNextButton, handleBackButton, initialData, handleFormChange }) => {
  const [formData, setFormData] = useState({
    interestedRole: '',
    hoursAvailable: '',
    visaStatus: '',
    visaOther: '',
    optSupport: '',
    desiredStartDate: '',
    otherRole: '',
    willingDifferentRole: '',
    skillsExperience: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateField = (name, data) => {
    const v = data[name];
    switch (name) {
      case 'interestedRole':
        if (!v) return 'Please select an interested role.';
        return '';
      case 'otherRole':
        if (data.interestedRole === 'Other' && (!v || !v.trim())) return 'Please specify the other role.';
        return '';
      case 'willingDifferentRole':
        if (!v) return 'Please answer this question.';
        return '';
      case 'skillsExperience':
        if (!v || !v.trim()) return 'Please describe your relevant skills and experience.';
        return '';
      case 'hoursAvailable':
        if (!v) return 'Please enter how many hours per week you are available.';
        if (Number(v) <= 0 || Number(v) > 168) return 'Hours must be between 1 and 168.';
        return '';
      case 'visaStatus':
        if (!v) return 'Please select your visa status.';
        return '';
      case 'visaOther':
        if (data.visaStatus === 'Other' && (!v || !v.trim())) return 'Please specify your visa status.';
        return '';
      case 'optSupport':
        if (!v) return 'Please answer whether you need OPT support.';
        return '';
      case 'desiredStartDate':
        if (!v) return 'Please select a desired start date.';
        {
          const todayStr = new Date().toISOString().split('T')[0];
          if (v < todayStr) return 'Desired Start Date cannot be in the past.';
        }
        return '';
      default:
        return '';
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

  const revalidate = (updated) => {
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(FIELD_LABELS).forEach((name) => {
        const msg = validateField(name, updated);
        if (msg) next[name] = msg; else delete next[name];
      });
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    handleFormChange(newData);
    revalidate(newData);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    revalidate(formData);
  };

  const handleCheckboxChange = (value) => {
    const newData = { ...formData, optSupport: value };
    setFormData(newData);
    handleFormChange(newData);
    setTouched((prev) => ({ ...prev, optSupport: true }));
    revalidate(newData);
  };

  const showError = (name) => (touched[name] || submitAttempted) && errors[name];

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = validateAll(formData);
    setErrors(allErrors);
    setSubmitAttempted(true);
    setTouched(Object.keys(FIELD_LABELS).reduce((acc, k) => ({ ...acc, [k]: true }), {}));

    if (Object.keys(allErrors).length === 0) {
      handleNextButton();
    } else {
      document.getElementById('role-availability-error-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const errorList = Object.entries(errors);

  return (
    <div className="form-container">
      <h5>Step 3: Select your role and availability</h5>

      {submitAttempted && errorList.length > 0 && (
        <div className="error-summary" id="role-availability-error-summary">
          <div className="error-summary-title">
            Please fix the following {errorList.length === 1 ? 'issue' : `${errorList.length} issues`}:
          </div>
          <ul className="error-summary-list">
            {errorList.map(([field, msg]) => (
              <li key={field}>{FIELD_LABELS[field] || field}: {msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="role-availability" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>
            Interested role<span className="requiredLabel">*</span>
          </label>
          <select
            name="interestedRole"
            className={showError('interestedRole') ? 'input-invalid' : ''}
            value={formData.interestedRole}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Please select</option>
            <option value="Product Manager">Product Management</option>
            <optgroup label="Roles">
              <option value="Data Analyst">Data Analyst</option>
              <option value="Grant Acquisitionist">Grant Acquisitionist (Exceptions granted to individuals with over 7 years of experience)</option>
              <option value="Architect">Architect</option>
              <option value="Editor/Writer">Editor/Writer</option>
              <option value="Graphic Artist">Graphic Artist</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Recruitment/Talent Acquisition">Recruitment/Talent Acquisition</option>
              <option value="Salesforce Developer">Salesforce Developer</option>
              <option value="SEO Functional Lead">SEO Functional Lead</option>
              <option value="Software Developer">Software Developer</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Legal Research">Legal Research</option>
              <option value="UX Researcher">UX Researcher (+2 years of direct experience | 20 hours required)</option>
              <option value="Public Relations">Public Relations</option>
              <option value="Functional Lead">Functional Lead (8 years of experience | Leadership Experience | Non-OPT)</option>
              <option value="Salesforce Admin">Salesforce Admin</option>
              <option value="Mobile Developer">Mobile Developer</option>
              <option value="HRIS & Analytics Lead">HRIS & Analytics Lead</option>
              <option value="Change Manager">Change Manager</option>
            </optgroup>
            <option value="Other">Other</option>
          </select>
          {showError('interestedRole') && <span className="field-error">{errors.interestedRole}</span>}
        </div>

        {formData.interestedRole === 'Other' && (
          <div className="form-group">
            <label>
              Please specify other role<span className="requiredLabel">*</span>
            </label>
            <input
              type="text"
              name="otherRole"
              className={showError('otherRole') ? 'input-invalid' : ''}
              value={formData.otherRole}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {showError('otherRole') && <span className="field-error">{errors.otherRole}</span>}
          </div>
        )}

        <div className="form-group">
          <label>
            Are you willing to take on a position you didn't apply for?<span className="requiredLabel">*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
            <label>
              <input
                type="radio"
                name="willingDifferentRole"
                value="Yes"
                checked={formData.willingDifferentRole === 'Yes'}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="willingDifferentRole"
                value="No"
                checked={formData.willingDifferentRole === 'No'}
                onChange={handleChange}
              />
              No
            </label>
          </div>
          <p className="form-hint">We may sometimes offer this if your experience doesn't match up with applied role.</p>
          {showError('willingDifferentRole') && <span className="field-error">{errors.willingDifferentRole}</span>}
        </div>

        <div className="form-group">
          <label>
            What skill sets and experiences do you have that will help you succeed in this position?<span className="requiredLabel">*</span>
          </label>
          <textarea
            name="skillsExperience"
            className={showError('skillsExperience') ? 'input-invalid' : ''}
            value={formData.skillsExperience}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
          />
          {showError('skillsExperience') && <span className="field-error">{errors.skillsExperience}</span>}
        </div>

        <div className="form-group">
          <label>
            Hours available to volunteer weekly<span className="requiredLabel">*</span>
          </label>
          <input
            type="number"
            name="hoursAvailable"
            min="1"
            max="168"
            className={showError('hoursAvailable') ? 'input-invalid' : ''}
            value={formData.hoursAvailable}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {showError('hoursAvailable') && <span className="field-error">{errors.hoursAvailable}</span>}
        </div>

        <div className="form-group">
          <label>
            Visa Status<span className="requiredLabel">*</span>
          </label>
          <select
            name="visaStatus"
            className={showError('visaStatus') ? 'input-invalid' : ''}
            value={formData.visaStatus}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Please select</option>
            <option value="US Citizen">US Citizen</option>
            <option value="Permanent Resident">Permanent Resident / Green Card</option>
            <option value="F1 visa">F1 visa</option>
            <option value="F1 OPT">F1 OPT</option>
            <option value="F1 STEM OPT">F1 STEM OPT</option>
            <option value="H1B">H1B</option>
            <option value="H4">H4</option>
            <option value="L1">L1</option>
            <option value="E3">E3</option>
            <option value="O1">O1</option>
            <option value="TN">TN</option>
            <option value="J1">J1</option>
            <option value="J2">J2</option>
            <option value="B1/B2">B1/B2</option>
            <option value="EAD">EAD</option>
            <option value="Other">Other</option>
          </select>
          {showError('visaStatus') && <span className="field-error">{errors.visaStatus}</span>}
        </div>

        {formData.visaStatus === 'Other' && (
          <div className="form-group">
            <label>
              Please specify your visa status<span className="requiredLabel">*</span>
            </label>
            <input
              type="text"
              name="visaOther"
              className={showError('visaOther') ? 'input-invalid' : ''}
              value={formData.visaOther}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {showError('visaOther') && <span className="field-error">{errors.visaOther}</span>}
          </div>
        )}

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', marginTop: '10px'}}>
          <label>
            Do you need OPT support?<span className="requiredLabel">*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px'}}>
            <label>
              <input
                type="checkbox"
                name="optSupport"
                checked={formData.optSupport === 'yes'}
                onChange={() => handleCheckboxChange('yes')}
              />
              Yes, I need OPT Support
            </label>
            <label>
              <input
                type="checkbox"
                name="optSupport"
                checked={formData.optSupport === 'approved'}
                onChange={() => handleCheckboxChange('approved')}
              />
              Yes, approved but haven't received the EAD card
            </label>
            <label>
              <input
                type="checkbox"
                name="optSupport"
                checked={formData.optSupport === 'no'}
                onChange={() => handleCheckboxChange('no')}
              />
              No
            </label>
          </div>
          {showError('optSupport') && <span className="field-error">{errors.optSupport}</span>}
        </div>

        <div className="form-group">
          <label>
            Desired start date to join KeelWorks<span className="requiredLabel">*</span>
          </label>
          <input
            type="date"
            name="desiredStartDate"
            className={showError('desiredStartDate') ? 'input-invalid' : ''}
            value={formData.desiredStartDate}
            onChange={handleChange}
            onBlur={handleBlur}
            min={new Date().toISOString().split('T')[0]}
          />
          {showError('desiredStartDate') && <span className="field-error">{errors.desiredStartDate}</span>}
        </div>

        <div className="form-group">
          <div className="button-group">
            <button
              type="button"
              className="back-button"
              onClick={handleBackButton}
            >
              Back
            </button>
            <button
              type="submit"
              className="submit-button"
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RoleAndAvailability;
