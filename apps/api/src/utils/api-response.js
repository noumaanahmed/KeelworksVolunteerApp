export const successResponse = (message, data = null, statusCode = 200) => ({
  status: "success",
  statusCode,
  message,
  data,
  error: null,
});

export const errorResponse = (message, error = null, statusCode = 500) => ({
  status: "error",
  statusCode,
  message,
  data: null,
  error,
});
