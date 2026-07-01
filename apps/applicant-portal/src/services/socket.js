import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/api";

export const createApplicantSocket = (token) =>
  io(API_BASE_URL, {
    auth: { token },
    withCredentials: true,
  });
