import React, { useState, useEffect } from 'react';

const FIELD_LABELS = {
  isAdult: 'Age confirmation (18+)',
  gender: 'Gender',
  sexualOrientation: 'Sexual orientation',
  disability: 'Disability',
};

const Identification = ({ handleBackButton, initialData, handleFormChange, handleFormSubmit }) => {
  const [formData, setFormData] = useState({
    isAdult: '',
    gender: '',
    sexualOrientation: '',
    disability: ''
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
      case 'isAdult':
        if (!v) return 'Please answer whether you are 18 years or older.';
        if (v === 'no') return 'You must be at least 18 years old to volunteer with KeelWorks.';
        return '';
      case 'gender':
        if (!v) return 'Please select your gender.';
        return '';
      case 'sexualOrientation':
        if (!v) return 'Please select your sexual orientation.';
        return '';
      case 'disability':
        if (!v) return 'Please answer the disability question.';
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
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    handleFormChange(updatedData);
    setTouched((prev) => ({ ...prev, [name]: true }));
    revalidate(updatedData);
  };

  const showError = (name) => (touched[name] || submitAttempted) && errors[name];

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = validateAll(formData);
    setErrors(allErrors);
    setSubmitAttempted(true);
    setTouched(Object.keys(FIELD_LABELS).reduce((acc, k) => ({ ...acc, [k]: true }), {}));

    if (Object.keys(allErrors).length === 0) {
      handleFormChange(formData);
      if (typeof handleFormSubmit === 'function') {
        handleFormSubmit(formData);
      }
    } else {
      document.getElementById('identification-error-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const errorList = Object.entries(errors);

  return (
    <div className="form-container">
      <h5>Step 5: Voluntary Identification</h5>

      {submitAttempted && errorList.length > 0 && (
        <div className="error-summary" id="identification-error-summary">
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

      <form className="identification" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>
            Are you 18 years of age or older?<span className="requiredLabel">*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
            <label>
              <input
                type="radio"
                name="isAdult"
                value="yes"
                checked={formData.isAdult === 'yes'}
                onChange={handleChange}
              />
              {' '}Yes
            </label>
            <label>
              <input
                type="radio"
                name="isAdult"
                value="no"
                checked={formData.isAdult === 'no'}
                onChange={handleChange}
              />
              {' '}No
            </label>
          </div>
          {showError('isAdult') && <span className="field-error">{errors.isAdult}</span>}
        </div>
        <div className="form-group">
          <label>
            Gender<span className="requiredLabel">*</span>
          </label>
          <select
            name="gender"
            className={showError('gender') ? 'input-invalid' : ''}
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Please select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="noAnswer">Prefer not to say</option>
          </select>
          {showError('gender') && <span className="field-error">{errors.gender}</span>}
        </div>
        <div className="form-group">
          <label>
            Sexual Orientation<span className="requiredLabel">*</span>
          </label>
          <select
            name="sexualOrientation"
            className={showError('sexualOrientation') ? 'input-invalid' : ''}
            value={formData.sexualOrientation}
            onChange={handleChange}
          >
            <option value="">Please select</option>
            <option value="asexual">Asexual</option>
            <option value="bisexual">Bisexual</option>
            <option value="gay">Gay</option>
            <option value="heterosexual">Heterosexual</option>
            <option value="lesbian">Lesbian</option>
            <option value="noAnswer">I don't wish to answer</option>
            <option value="other">Other</option>
          </select>
          {showError('sexualOrientation') && <span className="field-error">{errors.sexualOrientation}</span>}
        </div>
        <div className="form-group">
          <label>
            Disability<span className="requiredLabel">*</span>
          </label>
          <select
            name="disability"
            className={showError('disability') ? 'input-invalid' : ''}
            value={formData.disability}
            onChange={handleChange}
          >
            <option value="">Please select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="noAnswer">I don't wish to answer</option>
          </select>
          {showError('disability') && <span className="field-error">{errors.disability}</span>}
        </div>

        <div className="form-group">
          <div className="button-group">
            <button type="button" className="back-button" onClick={handleBackButton}>
              Back
            </button>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Identification;
