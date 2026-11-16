
import { findPatientById } from "../models/patient.model.js";
import { findDoctorById } from "../models/doctor.model.js";
import { findUserById } from "../models/user.model.js";
import {
  createAppointment,
  findAppointmentById,
  findAppointmentConflict,
  findAppointmentsByDoctor,
  updateAppointmentStatus,
} from "../models/appointment.model.js";
import type {
  AppointmentCreateInput,
  AppointmentIntervalQuery,
  AppointmentStatusUpdateInput,
} from "../schemas/appointment.schema.js";
import { AppError } from "../utils/app-error.js";

export const scheduleAppointment = async (data: AppointmentCreateInput) => {
  const scheduledAt = new Date(data.scheduledAt);

  if (scheduledAt <= new Date()) {
    throw new AppError(
      400,
      "INVALID_APPOINTMENT_DATE",
      "La cita debe programarse para una fecha futura.",
    );
  }

  const patient = await findPatientById(data.patientId);
  if (!patient) {
    throw new AppError(
      404,
      "PATIENT_NOT_FOUND",
      "No se encontró el paciente.",
    );
  }

  const doctor = await findDoctorById(data.doctorId);
  if (!doctor) {
    throw new AppError(
      404,
      "DOCTOR_NOT_FOUND",
      "No se encontró el médico.",
    );
  }

  const conflict = await findAppointmentConflict(
    data.patientId,
    data.doctorId,
    scheduledAt,
  );

  if (conflict) {
    throw new AppError(
      409,
      "APPOINTMENT_CONFLICT",
      "El paciente o el médico ya tiene una cita en ese horario.",
    );
  }

  return createAppointment(data);
};

export const getDoctorAgenda = async (
  userId: string,
  doctorId: string,
  interval: AppointmentIntervalQuery,
) => {
  const doctor = await findDoctorById(doctorId);

  if (!doctor) {
    throw new AppError(
      404,
      "DOCTOR_NOT_FOUND",
      "No se encontró el médico.",
    );
  }

  const user = await findUserById(userId);

  if (!user?.doctorId || user.doctorId !== doctorId) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "No tienes permiso para consultar esta agenda.",
    );
  }

  return findAppointmentsByDoctor(doctorId, interval);
};

export const changeAppointmentStatus = async (
  userId: string,
  appointmentId: string,
  data: AppointmentStatusUpdateInput,
) => {
  const user = await findUserById(userId);
  const appointment = await findAppointmentById(appointmentId);

  if (!appointment) {
    throw new AppError(
      404,
      "APPOINTMENT_NOT_FOUND",
      "No se encontró la cita.",
    );
  }

  const canModifyAppointment =
    user?.role === "RECEPCIONISTA" ||
    (user?.role === "MEDICO" &&
      Boolean(user.doctorId) &&
      appointment.doctorId === user.doctorId);

  if (!canModifyAppointment) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "No tienes permiso para modificar esta cita.",
    );
  }

  if (appointment.status !== "PROGRAMADA") {
    throw new AppError(
      409,
      "APPOINTMENT_ALREADY_FINALIZED",
      "La cita ya tiene un estado final.",
    );
  }

  return updateAppointmentStatus(appointmentId, data);
};
