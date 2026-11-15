import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";

type UserRole = "GERENCIA" | "RECEPCIONISTA" | "MEDICO";

export const authorizeRoles = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (request, _response, next) => {
    if (!request.user) {
      next(
        new AppError(
          401,
          "AUTHENTICATION_ERROR",
          "Se requiere autenticación.",
        ),
      );
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(
        new AppError(
          403,
          "FORBIDDEN",
          "No tienes permisos para realizar esta operación.",
        ),
      );
      return;
    }

    next();
  };
};
