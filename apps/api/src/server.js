import http from "http";
import app from "./app.js";
import "./models/index.js";
import { env, validateEnv } from "./config/env.js";
import { testDatabaseConnection } from "./config/database.js";
import { configureRealtime } from "./realtime/socket.js";

const startServer = async () => {
  try {
    validateEnv();
    await testDatabaseConnection();

    const server = http.createServer(app);
    const io = configureRealtime(server);

    app.set("io", io);

    server.listen(env.port, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("API startup failed:", error.message);
    process.exit(1);
  }
};

await startServer();
