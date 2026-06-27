export const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: "error",
      statusCode: 400,
      message: "Request body is required",
      error: "BAD_REQUEST",
    });
  }

  next();
};
