import { Router } from "express";
import authRoutes from "./auth.routes.js";
import applicationRoutes from "./applications.routes.js";
import locationRoutes from "./locations.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/applications", applicationRoutes);
router.use("/locations", locationRoutes);

export default router;
