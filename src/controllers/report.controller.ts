import type { RequestHandler } from "express";
import {
  appointmentsBySpecialtyReport,
  dailyCutoffReport,
} from "../services/report.service.js";
import { reportDateQuerySchema } from "../schemas/report.schema.js";
import { AppError } from "../utils/app-error.js";

export const appointmentsBySpecialtyController: RequestHandler = async (
  _request,
  response,
) => {
  const report = await appointmentsBySpecialtyReport();
  response.status(200).json(report);
};

export const dailyCutoffController: RequestHandler = async (
  request,
  response,
) => {
  const result = reportDateQuerySchema.safeParse(request.query);

  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "La fecha debe tener formato YYYY-MM-DD.");
  }

  const report = await dailyCutoffReport(result.data.date);
  response.status(200).json(report);
};
