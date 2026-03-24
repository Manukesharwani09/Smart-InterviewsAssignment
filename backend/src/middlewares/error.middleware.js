import { ApiError } from "../utils/ApiError.js";

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, "Route not found"));
};

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statuscode || err.status || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
  });
};

export { notFoundHandler, globalErrorHandler };
