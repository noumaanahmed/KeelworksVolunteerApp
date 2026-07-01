import { Router } from "express";
import {
  createApplication,
  getAdminApplication,
  listAdminApplications,
  listMyApplications,
  sendConfirmation,
  updateAdminApplicationStatus,
} from "../controllers/applications.controller.js";
import { requireAdmin, verifyToken } from "../middleware/auth.middleware.js";
import { requireJsonBody } from "../middleware/validate-request.middleware.js";

const router = Router();

router.post("/", verifyToken, requireJsonBody, createApplication);
router.get("/me", verifyToken, listMyApplications);

router.get("/admin", verifyToken, requireAdmin, listAdminApplications);
router.get("/admin/:employeeId", verifyToken, requireAdmin, getAdminApplication);
router.patch("/admin/:employeeId/status", verifyToken, requireAdmin, requireJsonBody, updateAdminApplicationStatus);

router.post("/confirmation-email", requireJsonBody, sendConfirmation);

export default router;
