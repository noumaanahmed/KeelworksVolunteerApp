import React, { useState } from 'react';

const DATE_RE = /^(0[1-9]|1[0-2])\/\d{4}$/;

const EducationAndExperience = ({ handleNextButton, handleBackButton, handleFormChange, initialData }) => {
    const [additionalInformation, setAdditionalInformation] = useState(initialData.additionalInformation || { linkedinProfile: '', resume: null });
    const [experiences, setExperiences] = useState(initialData.experiences || [{}]);
    const [education, setEducation] = useState(initialData.education || [{}]);
    const [fileName, setFileName] = useState(initialData.additionalInformation?.resume?.name || '');

    // errors shape: { experiences: [{field: msg}], education: [{field: msg}], resume: msg }
    const [errors, setErrors] = useState({ experiences: [], education: [], resume: '' });
    const [touched, setTouched] = useState({ experiences: [], education: [], resume: false });
    const [submitAttempted, setSubmitAttempted] = useState(false);

    // Compares two "MM/YYYY" strings. Returns true if `end` is the same month or later than `start`.
    const isEndAfterStart = (start, end) => {
        const startMatch = DATE_RE.exec((start || '').trim());
        const endMatch = DATE_RE.exec((end || '').trim());
        if (!startMatch || !endMatch) return true;
        const startValue = Number(start.split('/')[1]) * 12 + Number(start.split('/')[0]);
        const endValue = Number(end.split('/')[1]) * 12 + Number(end.split('/')[0]);
        return endValue >= startValue;
    };

    const validateExperience = (exp) => {
        const e = {};
        if (!exp.jobTitle || !exp.jobTitle.trim()) e.jobTitle = 'Job title is required.';
        if (!exp.company || !exp.company.trim()) e.company = 'Company is required.';
        if (!exp.location || !exp.location.trim()) e.location = 'Location is required.';
        if (!exp.startDate || !exp.startDate.trim()) e.startDate = 'Start date is required (MM/YYYY).';
        else if (!DATE_RE.test(exp.startDate.trim())) e.startDate = 'Use MM/YYYY format, e.g. 08/2024.';
        if (!exp.endDate || !exp.endDate.trim()) e.endDate = 'End date is required (MM/YYYY).';
        else if (!DATE_RE.test(exp.endDate.trim())) e.endDate = 'Use MM/YYYY format, e.g. 08/2024.';
        if (!e.startDate && !e.endDate && !isEndAfterStart(exp.startDate, exp.endDate)) {
            e.endDate = 'End Date cannot be earlier than Start Date.';
        }
        if (!exp.responsibilities || !exp.responsibilities.trim()) e.responsibilities = 'Responsibilities are required.';
        return e;
    };

    const validateEducation = (edu) => {
        const e = {};
        if (!edu.school || !edu.school.trim()) e.school = 'School or university name is required.';
        if (!edu.degree || !edu.degree.trim()) e.degree = 'Degree is required.';
        if (!edu.fieldOfStudy || !edu.fieldOfStudy.trim()) e.fieldOfStudy = 'Field of study is required.';
        if (!edu.eduStartDate || !edu.eduStartDate.trim()) e.eduStartDate = 'Start date is required (MM/YYYY).';
        else if (!DATE_RE.test(edu.eduStartDate.trim())) e.eduStartDate = 'Use MM/YYYY format, e.g. 08/2024.';
        if (!edu.eduEndDate || !edu.eduEndDate.trim()) e.eduEndDate = 'End date is required (MM/YYYY).';
        else if (!DATE_RE.test(edu.eduEndDate.trim())) e.eduEndDate = 'Use MM/YYYY format, e.g. 08/2024.';
        if (!e.eduStartDate && !e.eduEndDate && !isEndAfterStart(edu.eduStartDate, edu.eduEndDate)) {
            e.eduEndDate = 'End Date cannot be earlier than Start Date.';
        }
        if (!edu.eduResponsibilities || !edu.eduResponsibilities.trim()) e.eduResponsibilities = 'Responsibilities are required.';
        return e;
    };

    const validateResume = () => {
        if (!fileName && !additionalInformation.resume) return 'Please upload your resume.';
        return '';
    };

    const validateAll = () => ({
        experiences: experiences.map(validateExperience),
        education: education.map(validateEducation),
        resume: validateResume(),
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        const updatedData = {
            ...additionalInformation,
            [name]: type === 'file' ? files[0] : value,
        };
        if (type === 'file') {
            setFileName(files[0].name);
            setErrors((prev) => ({ ...prev, resume: '' }));
        }
        setAdditionalInformation((prevData) => {
            const newData = { ...prevData, ...updatedData };
            handleFormChange({ additionalInformation: newData, experiences, education });
            return newData;
        });
    };

    const handleExperienceChange = (index, e) => {
        const { name, value } = e.target;
        const updatedExperiences = experiences.map((exp, i) =>
            i === index ? { ...exp, [name]: value } : exp
        );
        setExperiences(updatedExperiences);
        handleFormChange({ additionalInformation, experiences: updatedExperiences, education });
        setErrors((prev) => {
            const next = { ...prev, experiences: [...prev.experiences] };
            next.experiences[index] = validateExperience(updatedExperiences[index]);
            return next;
        });
    };

    const handleExperienceBlur = (index) => {
        setTouched((prev) => {
            const next = { ...prev, experiences: [...prev.experiences] };
            next.experiences[index] = true;
            return next;
        });
    };

    const handleEducationChange = (index, e) => {
        const { name, value } = e.target;
        const updatedEducation = education.map((edu, i) =>
            i === index ? { ...edu, [name]: value } : edu
        );
        setEducation(updatedEducation);
        handleFormChange({ additionalInformation, experiences, education: updatedEducation });
        setErrors((prev) => {
            const next = { ...prev, education: [...prev.education] };
            next.education[index] = validateEducation(updatedEducation[index]);
            return next;
        });
    };

    const handleEducationBlur = (index) => {
        setTouched((prev) => {
            const next = { ...prev, education: [...prev.education] };
            next.education[index] = true;
            return next;
        });
    };

    const addExperience = () => {
        setExperiences([...experiences, {}]);
    };

    const deleteExperience = (index) => {
        const updatedExperiences = experiences.filter((_, i) => i !== index);
        setExperiences(updatedExperiences);
        handleFormChange({ additionalInformation, experiences: updatedExperiences, education });
        setErrors((prev) => ({ ...prev, experiences: prev.experiences.filter((_, i) => i !== index) }));
        setTouched((prev) => ({ ...prev, experiences: prev.experiences.filter((_, i) => i !== index) }));
    };

    const addEducation = () => {
        setEducation([...education, {}]);
    };

    const deleteEducation = (index) => {
        const updatedEducation = education.filter((_, i) => i !== index);
        setEducation(updatedEducation);
        handleFormChange({ additionalInformation, experiences, education: updatedEducation });
        setErrors((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
        setTouched((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    };

    const showExpError = (index, field) =>
        (touched.experiences[index] || submitAttempted) && errors.experiences[index]?.[field];

    const showEduError = (index, field) =>
        (touched.education[index] || submitAttempted) && errors.education[index]?.[field];

    const showResumeError = (touched.resume || submitAttempted) && errors.resume;

    const handleSubmit = (e) => {
        e.preventDefault();
        const allErrors = validateAll();
        setErrors(allErrors);
        setSubmitAttempted(true);
        setTouched({
            experiences: experiences.map(() => true),
            education: education.map(() => true),
            resume: true,
        });

        const hasExpErrors = allErrors.experiences.some((e) => Object.keys(e).length > 0);
        const hasEduErrors = allErrors.education.some((e) => Object.keys(e).length > 0);
        const hasResumeError = !!allErrors.resume;

        if (!hasExpErrors && !hasEduErrors && !hasResumeError) {
            handleNextButton();
        } else {
            document.getElementById('education-experience-error-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Build a flat list of error messages for the summary box
    const summaryItems = [];
    if (submitAttempted) {
        errors.experiences.forEach((e, i) => {
            Object.entries(e).forEach(([field, msg]) => {
                summaryItems.push(`Experience ${i + 1} — ${field}: ${msg}`);
            });
        });
        errors.education.forEach((e, i) => {
            Object.entries(e).forEach(([field, msg]) => {
                summaryItems.push(`Education ${i + 1} — ${field}: ${msg}`);
            });
        });
        if (errors.resume) summaryItems.push(`Resume: ${errors.resume}`);
    }

    return (
        <div className="form-container">
            <h5>Step 2: Add your education and experience</h5>

            {submitAttempted && summaryItems.length > 0 && (
                <div className="error-summary" id="education-experience-error-summary">
                    <div className="error-summary-title">
                        Please fix the following {summaryItems.length === 1 ? 'issue' : `${summaryItems.length} issues`}:
                    </div>
                    <ul className="error-summary-list">
                        {summaryItems.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                </div>
            )}

            <form className="education-experience-form" onSubmit={handleSubmit} noValidate>
                {/* Experience Section */}
                {experiences.map((experience, index) => (
                    <div key={index} >
                        <div className="form-row" style={{ justifyContent: "space-between", marginBottom: '20px' }}>
                            <h6>Experience {index + 1}</h6>
                            <button type="button" className="delete-btn" onClick={() => deleteExperience(index)}>
                                🗑️ Delete
                            </button>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Job Title<span className="requiredLabel">*</span></label>
                            <input
                                type="text" name="jobTitle"
                                className={showExpError(index, 'jobTitle') ? 'input-invalid' : ''}
                                value={experience.jobTitle || ''}
                                onChange={(e) => handleExperienceChange(index, e)}
                                onBlur={() => handleExperienceBlur(index)}
                            />
                            {showExpError(index, 'jobTitle') && <span className="field-error">{errors.experiences[index].jobTitle}</span>}
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Company<span className="requiredLabel">*</span></label>
                            <input
                                type="text" name="company"
                                className={showExpError(index, 'company') ? 'input-invalid' : ''}
                                value={experience.company || ''}
                                onChange={(e) => handleExperienceChange(index, e)}
                                onBlur={() => handleExperienceBlur(index)}
                            />
                            {showExpError(index, 'company') && <span className="field-error">{errors.experiences[index].company}</span>}
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Location<span className="requiredLabel">*</span></label>
                            <input
                                type="text" name="location"
                                className={showExpError(index, 'location') ? 'input-invalid' : ''}
                                value={experience.location || ''}
                                onChange={(e) => handleExperienceChange(index, e)}
                                onBlur={() => handleExperienceBlur(index)}
                            />
                            {showExpError(index, 'location') && <span className="field-error">{errors.experiences[index].location}</span>}
                        </div>
                        <div className="form-row">
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>Start Date<span className="requiredLabel">*</span></label>
                                <input
                                 type="text"
                                 name="startDate"
                                 className={showExpError(index, 'startDate') ? 'input-invalid' : ''}
                                 value={experience.startDate || ''}
                                 placeholder="MM/YYYY"
                                 maxLength="7"
                                 title="Please enter the date in MM/YYYY format, e.g., 08/2024"
                                 onChange={(e) => handleExperienceChange(index, e)}
                                 onBlur={() => handleExperienceBlur(index)}
                                 />
                                {showExpError(index, 'startDate') && <span className="field-error">{errors.experiences[index].startDate}</span>}
                            </div>
                            <div className="form-group">
                                <label>End Date<span className="requiredLabel">*</span></label>
                                <input
                                  type="text"
                                  name="endDate"
                                  className={showExpError(index, 'endDate') ? 'input-invalid' : ''}
                                  value={experience.endDate || ''}
                                  placeholder="MM/YYYY"
                                  maxLength="7"
                                  title="Please enter the date in MM/YYYY format, e.g., 08/2024"
                                  onChange={(e) => handleExperienceChange(index, e)}
                                  onBlur={() => handleExperienceBlur(index)}
                                />
                                {showExpError(index, 'endDate') && <span className="field-error">{errors.experiences[index].endDate}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Responsibilities<span className="requiredLabel">*</span></label>
                            <textarea
                                name="responsibilities" rows="4"
                                className={showExpError(index, 'responsibilities') ? 'input-invalid' : ''}
                                value={experience.responsibilities || ''}
                                onChange={(e) => handleExperienceChange(index, e)}
                                onBlur={() => handleExperienceBlur(index)}
                            />
                            {showExpError(index, 'responsibilities') && <span className="field-error">{errors.experiences[index].responsibilities}</span>}
                        </div>
                    </div>
                ))}
                <button type="button" className="add-button" onClick={addExperience}>
                    Add Another Experience
                </button>

                {/* Education Section */}
                {education.map((edu, index) => (
                    <div key={index}>
                        <div className="form-row" style={{ justifyContent: "space-between", marginBottom: '20px' }}>
                            <h6>Education {index + 1}</h6>
                            <button type="button" className="delete-btn" onClick={() => deleteEducation(index)}>
                                🗑️ Delete
                            </button>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>School or University Name<span className="requiredLabel">*</span></label>
                            <input
                                type="text" name="school"
                                className={showEduError(index, 'school') ? 'input-invalid' : ''}
                                value={edu.school || ''}
                                onChange={(e) => handleEducationChange(index, e)}
                                onBlur={() => handleEducationBlur(index)}
                            />
                            {showEduError(index, 'school') && <span className="field-error">{errors.education[index].school}</span>}
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Degree<span className="requiredLabel">*</span></label>
                            <input
                                type="text" name="degree"
                                className={showEduError(index, 'degree') ? 'input-invalid' : ''}
                                value={edu.degree || ''}
                                onChange={(e) => handleEducationChange(index, e)}
                                onBlur={() => handleEducationBlur(index)}
                            />
                            {showEduError(index, 'degree') && <span className="field-error">{errors.education[index].degree}</span>}
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Field of Study<span className="requiredLabel">*</span></label>
                            <input
                                type="text" name="fieldOfStudy"
                                className={showEduError(index, 'fieldOfStudy') ? 'input-invalid' : ''}
                                value={edu.fieldOfStudy || ''}
                                onChange={(e) => handleEducationChange(index, e)}
                                onBlur={() => handleEducationBlur(index)}
                            />
                            {showEduError(index, 'fieldOfStudy') && <span className="field-error">{errors.education[index].fieldOfStudy}</span>}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date<span className="requiredLabel">*</span></label>
                                <input
                                  type="text"
                                  name="eduStartDate"
                                  className={showEduError(index, 'eduStartDate') ? 'input-invalid' : ''}
                                  value={edu.eduStartDate || ''}
                                  placeholder="MM/YYYY"
                                  maxLength="7"
                                  title="Please enter the date in MM/YYYY format, e.g., 08/2024"
                                  onChange={(e) => handleEducationChange(index, e)}
                                  onBlur={() => handleEducationBlur(index)}
                                  />
                                {showEduError(index, 'eduStartDate') && <span className="field-error">{errors.education[index].eduStartDate}</span>}
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>End Date or Expected<span className="requiredLabel">*</span></label>
                                <input
                                  type="text"
                                  name="eduEndDate"
                                  className={showEduError(index, 'eduEndDate') ? 'input-invalid' : ''}
                                  value={edu.eduEndDate || ''}
                                  placeholder="MM/YYYY"
                                  maxLength="7"
                                  title="Please enter the date in MM/YYYY format, e.g., 08/2024"
                                  onChange={(e) => handleEducationChange(index, e)}
                                  onBlur={() => handleEducationBlur(index)}
                                />
                                {showEduError(index, 'eduEndDate') && <span className="field-error">{errors.education[index].eduEndDate}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Responsibilities<span className="requiredLabel">*</span></label>
                            <textarea
                                name="eduResponsibilities" rows="4"
                                className={showEduError(index, 'eduResponsibilities') ? 'input-invalid' : ''}
                                value={edu.eduResponsibilities || ''}
                                onChange={(e) => handleEducationChange(index, e)}
                                onBlur={() => handleEducationBlur(index)}
                            />
                            {showEduError(index, 'eduResponsibilities') && <span className="field-error">{errors.education[index].eduResponsibilities}</span>}
                        </div>
                    </div>
                ))}
                <button type="button" className="add-button" onClick={addEducation}>
                    Add Another Education
                </button>

                {/* Additional Information */}
                <h6>Additional Information</h6>
                <div className="form-group">
                    <label>LinkedIn Profile Link (optional)</label>
                    <input type="text" name="linkedinProfile" value={additionalInformation.linkedinProfile} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Additional website (optional)</label>
                    <input type="text" name="additionalWebsite" value={additionalInformation.additionalWebsite} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Resume<span className="requiredLabel">*</span></label>
                    <input
                        type="file" name="resume" accept=".pdf, .doc, .docx"
                        className={showResumeError ? 'input-invalid' : ''}
                        onChange={handleChange}
                        onBlur={() => setTouched((prev) => ({ ...prev, resume: true }))}
                    />
                    {fileName && <p className="file-info">Uploaded file: {fileName}</p>}
                    <p className="file-info">File types allowed: PDF, DOC</p>
                    {showResumeError && <span className="field-error">{errors.resume}</span>}
                </div>

                {/* Buttons */}
                <div className="form-group">
                    <div className="button-group">
                        <button type="button" className="back-button" onClick={handleBackButton}>
                            Back
                        </button>
                        <button type="submit" className="submit-button">
                            Next
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EducationAndExperience;
