import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const allowedOrigins = env.corsOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true;
  return allowedOrigins.includes(origin);
};

export const configureRealtime = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) return callback(null, true);
        return callback(new Error("Not allowed by Socket.IO CORS"));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Socket authentication token is required."));
    }

    try {
      socket.user = jwt.verify(token, env.auth.jwtSecret);
      return next();
    } catch {
      return next(new Error("Invalid socket authentication token."));
    }
  });

  io.on("connection", (socket) => {
    const { user_id: userId, role } = socket.user;

    if (role === "admin") {
      socket.join("admins");
      console.log(`Admin socket connected: ${socket.id}`);
    }

    if (role === "applicant" && userId) {
      socket.join(`applicant:${userId}`);
      console.log(`Applicant socket connected: ${socket.id}`);
    }

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
