import React, { useState, useEffect } from 'react';

const FIELD_LABELS = {
  interestReason: 'Reason for interest in KeelWorks',
};

const wordCount = (text) => (text || '').trim().split(/\s+/).filter(Boolean).length;

const AdditionalInformation = ({ handleNextButton, handleBackButton, initialData, handleFormChange }) => {
  const [formData, setFormData] = useState({
    interestReason: '',
    additionalInfo: ''
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
      case 'interestReason':
        if (!v || !v.trim()) return 'Please tell us why you are interested in KeelWorks.';
        if (wordCount(v) < 100) return `Please write at least 100 words (currently ${wordCount(v)}).`;
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
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    handleFormChange(updated);
    revalidate(updated);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    revalidate(formData);
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
      document.getElementById('additional-info-error-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const errorList = Object.entries(errors);
  const currentWordCount = wordCount(formData.interestReason);

  return (
    <div className="form-container">
      <h5>Step 4: Tell us more about your interests</h5>

      {submitAttempted && errorList.length > 0 && (
        <div className="error-summary" id="additional-info-error-summary">
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

      <form className="additional-information" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>
            Why are you interested in working with KeelWorks?
            <span className="requiredLabel">*</span>
          </label>
          <textarea
            name="interestReason"
            rows="6"
            placeholder="Explain why you want to work with our organization"
            className={showError('interestReason') ? 'input-invalid' : ''}
            value={formData.interestReason}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <p style={{ color: currentWordCount < 100 ? '#cc0000' : 'gray' }}>
            {currentWordCount} / 100 words minimum
          </p>
          {showError('interestReason') && <span className="field-error">{errors.interestReason}</span>}
        </div>
        <div className="form-group" style={{ marginTop: '10px' }}>
          <label>Any other information (optional)</label>
          <textarea
            name="additionalInfo"
            rows="6"
            placeholder="Anything else we should know about you"
            value={formData.additionalInfo}
            onChange={handleChange}
          />
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

export default AdditionalInformation;
