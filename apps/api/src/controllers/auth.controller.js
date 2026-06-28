import { getCurrentUser, signIn, signUp } from "../services/auth.service.js";
import { successResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const signup = asyncHandler(async (req, res) => {
  const result = await signUp(req.body);
  return res.status(201).json(successResponse("Account created successfully.", result, 201));
});

export const signin = asyncHandler(async (req, res) => {
  const result = await signIn(req.body);
  return res.status(200).json(successResponse("Signed in successfully.", result));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.user_id);
  return res.status(200).json(successResponse("Current user retrieved.", { user }));
});
