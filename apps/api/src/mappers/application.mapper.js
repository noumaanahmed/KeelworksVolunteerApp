import { APPLICATION_STATUS_LABELS, getStatusActions } from "../constants/application-status.js";

export const toStatusDisplay = (status) => ({
  value: status,
  label: APPLICATION_STATUS_LABELS[status] || status,
});

export const toApplicationSummary = (application) => ({
  employee_id: application.employee_id,
  first_name: application.first_name,
  middle_name: application.middle_name,
  last_name: application.last_name,
  interested_role: application.interested_role,
  application_status: application.application_status,
  application_status_label: APPLICATION_STATUS_LABELS[application.application_status] || application.application_status,
  application_date: application.application_date,
});

export const toAdminApplicationRow = (application) => ({
  employee_id: application.employee_id,
  first_name: application.first_name,
  middle_name: application.middle_name,
  last_name: application.last_name,
  personal_email: application.personal_email,
  phone: application.phone,
  phonetype: application.phonetype,
  gender: application.gender,
  time_zone: application.time_zone,
  visa_status: application.visa_status,
  opt_support: application.opt_support,
  hours_commitment: application.hours_commitment,
  start_date: application.start_date,
  application_status: application.application_status,
  application_status_label: APPLICATION_STATUS_LABELS[application.application_status] || application.application_status,
  application_date: application.application_date,
  linkedin_url: application.linkedin_url,
  additional_websites: application.additional_websites,
  why_kworks: application.why_kworks,
  additional_info: application.additional_info,
  interested_role: application.interested_role,
});

const toPlain = (model) => model?.toJSON ? model.toJSON() : model;

const mapAddress = (application) => {
  const address = toPlain(application.Address);
  if (!address) return null;

  const city = address.City || null;
  const state = city?.State || null;
  const country = state?.Country || null;

  return {
    address_id: address.address_id,
    address1: address.address1,
    address2: address.address2,
    zip_code: address.zip_code,
    city: city ? {
      city_id: city.city_id,
      city_name: city.city_name,
    } : null,
    state: state ? {
      state_id: state.state_id,
      state_name: state.state_name,
    } : null,
    country: country ? {
      country_id: country.country_id,
      country_name: country.country_name,
      country_code: country.country_code,
    } : null,
  };
};

const mapStatusHistory = (history = []) =>
  history.map((item) => ({
    history_id: item.history_id,
    previous_status: item.previous_status,
    previous_status_label: item.previous_status ? APPLICATION_STATUS_LABELS[item.previous_status] || item.previous_status : null,
    new_status: item.new_status,
    new_status_label: APPLICATION_STATUS_LABELS[item.new_status] || item.new_status,
    note: item.note,
    forwarded_to: item.forwarded_to,
    action_label: item.action_label,
    changed_by: item.changed_by ? {
      user_id: item.changed_by.user_id,
      full_name: item.changed_by.full_name,
      email: item.changed_by.email,
      role: item.changed_by.role,
    } : null,
    created_at: item.created_at,
  }));

export const toAdminApplicationDetail = (application) => {
  const plain = toPlain(application);
  const currentStatus = plain.application_status;

  return {
    ...toAdminApplicationRow(plain),
    address: mapAddress(application),
    education: (plain.Education || plain.Educations || []).map((item) => ({
      education_id: item.education_id,
      institution_name: item.institution_name,
      degree: item.degree,
      major: item.major,
      start_date: item.start_date,
      end_date: item.end_date,
    })),
    employment: (plain.Employment || plain.Employments || []).map((item) => ({
      employment_id: item.employment_id,
      company_name: item.company_name,
      job_title: item.job_title,
      location: item.location,
      start_date: item.start_date,
      end_date: item.end_date,
      responsibilities: item.responsibilities,
    })),
    eeo: plain.EEOData ? {
      eeo_data_id: plain.EEOData.eeo_data_id,
      sexual_orientation: plain.EEOData.sexual_orientation,
      disability: plain.EEOData.disability,
      submission_date: plain.EEOData.submission_date,
    } : null,
    status_history: mapStatusHistory(plain.status_history || []),
    next_actions: getStatusActions(currentStatus),
  };
};
