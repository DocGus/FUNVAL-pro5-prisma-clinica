
import type { ErrorRequestHandler } from "express";

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
      status: "error",
      message: "JSON inválido en la solicitud",
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
};