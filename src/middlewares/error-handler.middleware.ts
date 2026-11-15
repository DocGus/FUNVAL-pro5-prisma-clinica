import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  const isBadJson =
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400;

  if (isBadJson) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "JSON inválido en la solicitud.",
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor.",
    },
  });
};
