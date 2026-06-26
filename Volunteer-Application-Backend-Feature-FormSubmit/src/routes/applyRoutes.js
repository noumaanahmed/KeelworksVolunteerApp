import { Router } from "express";
import { uploadDocument } from "../controllers/documentController.js";
import {
  getCountries,
  getStates,
  getCities,
  getCountryCodes,
  createCity,
  sendConfirmation,
  getMyApplications,
} from "../controllers/applyController.js";
import {
  createEmployee,
  errorHandler,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import {
  validateRequestBody,
  employeeValidationRules,
  paginationValidationRules,
  idValidationRules,
} from "../middleware/validationMiddleware.js";
import verifyToken, { requireAdmin } from "../middleware/jwtAuthenticationMiddleware.js";

const routes = Router();

// Public - location
routes.get("/countries", getCountries);
routes.get("/states/:countryCode", getStates);
routes.get("/cities/:stateCode", getCities);
routes.post("/cities", createCity);
routes.get("/countryPhoneCodes", getCountryCodes);

// Public - submit application
routes.post("/employees", validateRequestBody, employeeValidationRules, createEmployee);

// Public - confirmation email
routes.post("/send-confirmation-email", sendConfirmation);

// Logged-in applicant - view their own application(s)
routes.get("/my-applications", verifyToken, getMyApplications);

// Public - upload
routes.post("/upload/", uploadDocument);

// Admin only - view applications
routes.get("/employees", verifyToken, requireAdmin, paginationValidationRules, getAllEmployees);
routes.get("/employees/:id", verifyToken, requireAdmin, idValidationRules, getEmployeeById);
routes.put("/employees/:id", verifyToken, requireAdmin, validateRequestBody, idValidationRules, employeeValidationRules, updateEmployee);
routes.delete("/employees/:id", verifyToken, requireAdmin, idValidationRules, deleteEmployee);

routes.use(errorHandler);

export default routes;