import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import config from "../../config";
import ApiError from "../../utils/ApiError";
import { TErrorSources } from "../../interfaces/error";
import handleValidationError from "../../errors/handleValidationError";
import handleCastError from "../../errors/handleCastError";
import handleDuplicateError from "../../errors/handleDuplicateError";
import handleZodError from "../../errors/handleZodError";

// You will need to create the error handler files (e.g., handleZodError)

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSources = [
    { path: "", message: "Something went wrong" },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.env === "development" ? err?.stack : undefined,
  });
};

export default globalErrorHandler;

// NOTE: You will need to create the error handler files mentioned above.
// For example, in /src/errors/handleZodError.ts
