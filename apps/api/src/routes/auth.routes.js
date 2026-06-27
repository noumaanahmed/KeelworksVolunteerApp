import { Router } from "express";
import { signup, signin, getMe } from "../controllers/auth.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.get("/me", verifyToken, getMe);

export default authRouter;