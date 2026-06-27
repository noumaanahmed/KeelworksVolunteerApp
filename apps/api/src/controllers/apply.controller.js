import locationDB from "../repositories/location.repository.js";
import { sendConfirmationEmail } from "../services/email.service.js";
import Employee from "../models/employeeModel.js";

const createResponse = (status, statusCode, message, data = null, error = null) => ({
  status, statusCode, message, data, error,
});

const getCountries = async (req, res) => {
  let countries = await locationDB.getAllCountries();
  return res.status(200).json(createResponse("Success", 200, null, countries, null));
};

const getStates = async (req, res) => {
  let { countryCode } = req.params;
  let states = await locationDB.getAllStates(countryCode);
  if (!states || states.length === 0) {
    return res.status(404).json(createResponse("Not Found", 404, null, null, "CountryCode not found"));
  }
  return res.status(200).json(createResponse("Success", 200, null, states, null));
};

const getCities = async (req, res) => {
  let { stateCode } = req.params;
  let cities = await locationDB.getAllCities(stateCode);
  if (!cities || cities.length === 0) {
    return res.status(404).json(createResponse("Not Found", 404, null, null, "stateCode not found"));
  }
  return res.status(200).json(createResponse("Success", 200, null, cities, null));
};

const getCountryCodes = async (req, res) => {
  let countryPhoneCodes = await locationDB.getAllCountryPhoneCodes();
  return res.status(200).json(createResponse("Success", 200, null, countryPhoneCodes, null));
};

const createCity = async (req, res) => {
  const { state_id, city_name } = req.body;
  if (!state_id || !city_name) {
    return res.status(400).json(createResponse("Bad request", 400, null, null, "state_id and city_name are required"));
  }
  try {
    const city = await locationDB.createCity(Number(state_id), city_name);
    return res.status(201).json(createResponse("Success", 201, null, city, null));
  } catch (error) {
    console.error("createCity error", error);
    return res.status(400).json(createResponse("Bad request", 400, null, null, error));
  }
};

const sendConfirmation = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json(createResponse("error", 400, null, null, "email is required"));
    }
    const result = await sendConfirmationEmail({ email, name });
    return res.status(200).json(createResponse("success", 200, "Confirmation email sent", result));
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json(createResponse("error", 500, "Failed to send email", null, error.message));
  }
};

/**
 * Get the logged-in applicant's own submitted application(s), matched by
 * their account email. Requires a valid JWT (verifyToken middleware).
 * @route GET /api/v1/apply/my-applications
 */
const getMyApplications = async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json(createResponse("error", 401, null, null, "Not authenticated"));
    }

    const applications = await Employee.findAll({
      where: { personal_email: email },
      order: [["employee_id", "DESC"]],
      attributes: [
        "employee_id",
        "first_name",
        "middle_name",
        "last_name",
        "interested_role",
        "application_status",
        "application_date",
      ],
    });

    return res.status(200).json(createResponse("success", 200, null, { applications }));
  } catch (error) {
    console.error("getMyApplications error:", error);
    return res.status(500).json(createResponse("error", 500, "Server error", null, error.message));
  }
};

export { getCountries, getStates, getCities, getCountryCodes, createCity, sendConfirmation, getMyApplications };