import routes from "./apply.routes.js";
import authRouter from "./auth.routes.js";

const createResponse = (status, statusCode, message, data = null, error = null) => ({
  status, statusCode, message, data, error,
});

const constructorMethod = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/apply", routes);
  app.use((req, res) => {
    return res.status(404).json(createResponse("Not found", 404, null, null, "Route Not Found"));
  });
};

export default constructorMethod;