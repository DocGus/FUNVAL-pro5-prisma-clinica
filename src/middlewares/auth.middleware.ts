import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

const isValidRole = (
  role: unknown,
): role is "GERENCIA" | "RECEPCIONISTA" | "MEDICO" =>
  role === "GERENCIA" ||
  role === "RECEPCIONISTA" ||
  role === "MEDICO";

export const authenticate: RequestHandler = (
  request,
  _response,
  next,
) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(
      new AppError(
        401,
        "AUTHENTICATION_ERROR",
        "Se requiere un token de autenticación.",
      ),
    );
    return;
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (
      typeof payload !== "object" ||
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      !isValidRole(payload.role)
    ) {
      throw new Error("Token payload inválido.");
    }

    request.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    next(
      new AppError(
        401,
        "AUTHENTICATION_ERROR",
        "El token es inválido o ha expirado.",
      ),
    );
  }
};
