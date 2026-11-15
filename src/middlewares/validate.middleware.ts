import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/app-error.js";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Los datos enviados no cumplen las validaciones requeridas.",
        ),
      );
      return;
    }

    request.body = result.data;
    next();
  };
};
