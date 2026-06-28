import { Router } from "express";
import { getMe, signin, signup } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireJsonBody } from "../middleware/validate-request.middleware.js";

const router = Router();

router.post("/signup", requireJsonBody, signup);
router.post("/signin", requireJsonBody, signin);
router.get("/me", verifyToken, getMe);

export default router;
