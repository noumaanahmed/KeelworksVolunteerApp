import { Router } from "express";
import { signup, signin, getMe } from "../controllers/authController.js";
import verifyToken from "../middleware/jwtAuthenticationMiddleware.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.get("/me", verifyToken, getMe);

export default authRouter;