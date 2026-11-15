import type { RequestHandler } from "express";
import {
  scheduleAppointment,
  getDoctorAgenda,
  changeAppointmentStatus,
} from "../services/appointment.service.js";
import {
  appointmentCreateSchema,
  appointmentIdParamsSchema,
  appointmentStatusUpdateSchema,
  appointmentIntervalQuerySchema,
} from "../schemas/appointment.schema.js";
import { AppError } from "../utils/app-error.js";

export const createAppointmentController: RequestHandler = async (
  request,
  response,
) => {
  const result = appointmentCreateSchema.safeParse(request.body);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Los datos de la cita no son válidos.");
  }

  const appointment = await scheduleAppointment(result.data);
  response.status(201).json(appointment);
};

export const getDoctorAgendaController: RequestHandler = async (
  request,
  response,
) => {
  const interval = appointmentIntervalQuerySchema.safeParse(request.query);
  if (!interval.success) {
    throw new AppError(400, "VALIDATION_ERROR", "El intervalo de fechas no es válido.");
  }

  const appointments = await getDoctorAgenda(
    request.user!.id,
    request.params.id as string,
    interval.data,
  );

  response.status(200).json(appointments);
};

export const updateAppointmentStatusController: RequestHandler = async (
  request,
  response,
) => {
  const params = appointmentIdParamsSchema.safeParse(request.params);
  const body = appointmentStatusUpdateSchema.safeParse(request.body);

  if (!params.success || !body.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Los datos enviados no son válidos.");
  }

  const appointment = await changeAppointmentStatus(
    request.user!.id,
    params.data.id,
    body.data,
  );

  response.status(200).json(appointment);
};
