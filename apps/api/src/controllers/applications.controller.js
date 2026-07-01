import {
  changeAdminApplicationStatus,
  getAdminApplicationDetail,
  getAdminApplications,
  getMyApplications,
  submitApplication,
} from "../services/applications.service.js";
import { sendConfirmationEmail } from "../services/email.service.js";
import { successResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";

export const createApplication = asyncHandler(async (req, res) => {
  const result = await submitApplication(req.body, req.user);
  const io = req.app.get("io");

  if (io && result?.employee_id) {
    const application = await getAdminApplicationDetail(result.employee_id);
    io.to("admins").emit("application:created", { application });
  }

  return res.status(201).json(successResponse("Application submitted successfully.", { employee: result }, 201));
});

export const listMyApplications = asyncHandler(async (req, res) => {
  const applications = await getMyApplications(req.user);
  return res.status(200).json(successResponse("Applications retrieved.", { applications }));
});

export const listAdminApplications = asyncHandler(async (req, res) => {
  const result = await getAdminApplications(req.query);
  return res.status(200).json(successResponse("Applications retrieved.", result));
});

export const getAdminApplication = asyncHandler(async (req, res) => {
  const application = await getAdminApplicationDetail(req.params.employeeId);
  return res.status(200).json(successResponse("Application retrieved.", { application }));
});

export const updateAdminApplicationStatus = asyncHandler(async (req, res) => {
  const application = await changeAdminApplicationStatus({
    employeeId: req.params.employeeId,
    payload: req.body,
    authenticatedUser: req.user,
  });
  const io = req.app.get("io");

  if (io) {
    io.to("admins").emit("application:statusUpdated", { application });

    if (application?.user_id) {
      io.to(`applicant:${application.user_id}`).emit("application:statusUpdated", { application });
    }
  }

  return res.status(200).json(successResponse("Application status updated.", { application }));
});

export const sendConfirmation = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!email) throw new AppError("Email is required.", 400, "EMAIL_REQUIRED");

  const result = await sendConfirmationEmail({ email, name });
  return res.status(200).json(successResponse("Confirmation email processed.", result));
});
