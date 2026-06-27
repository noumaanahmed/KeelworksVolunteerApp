import { Router } from "express";
import { uploadDocument } from "../controllers/document.controller.js";
import {
  getCountries,
  getStates,
  getCities,
  getCountryCodes,
  createCity,
  sendConfirmation,
  getMyApplications,
} from "../controllers/apply.controller.js";
import {
  createEmployee,
  errorHandler,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller.js";
import {
  validateRequestBody
} from "../middleware/validation.middleware.js";
import verifyToken, { requireAdmin } from "../middleware/auth.middleware.js";

const routes = Router();

// Public - location
routes.get("/countries", getCountries);
routes.get("/states/:countryCode", getStates);
routes.get("/cities/:stateCode", getCities);
routes.post("/cities", createCity);
routes.get("/countryPhoneCodes", getCountryCodes);

// Public - submit application
routes.post("/employees", validateRequestBody, createEmployee);

// Public - confirmation email
routes.post("/send-confirmation-email", sendConfirmation);

// Logged-in applicant - view their own application(s)
routes.get("/my-applications", verifyToken, getMyApplications);

// Public - upload
routes.post("/upload/", uploadDocument);

// Admin only - view applications
routes.get("/employees", verifyToken, requireAdmin, getAllEmployees);
routes.get("/employees/:id", verifyToken, requireAdmin, getEmployeeById);
routes.put("/employees/:id", verifyToken, requireAdmin, validateRequestBody, updateEmployee);
routes.delete("/employees/:id", verifyToken, requireAdmin, deleteEmployee);

routes.use(errorHandler);

export default routes;