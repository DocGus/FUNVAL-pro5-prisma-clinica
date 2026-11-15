import type { RequestHandler } from "express";

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
    path: request.originalUrl,
  });
};
