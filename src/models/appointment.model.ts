import { prisma } from "../config/prisma.js";
import type {
  AppointmentCreateInput,
  AppointmentStatusUpdateInput,
  AppointmentIntervalQuery,
} from "../schemas/appointment.schema.js";

export const createAppointment = (data: AppointmentCreateInput) =>
  prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      scheduledAt: new Date(data.scheduledAt),
      ...(data.reason !== undefined ? { reason: data.reason } : {}),
    },
    include: {
      patient: true,
      doctor: { include: { specialty: true } },
    },
  });

export const findAppointmentById = (id: string) =>
  prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { specialty: true } },
    },
  });

export const findAppointmentConflict = (
  patientId: string,
  doctorId: string,
  scheduledAt: Date,
) =>
  prisma.appointment.findFirst({
    where: {
      scheduledAt,
      OR: [{ patientId }, { doctorId }],
    },
    select: { id: true },
  });

export const findAppointmentsByDoctor = (
  doctorId: string,
  interval: AppointmentIntervalQuery,
) =>
  prisma.appointment.findMany({
    where: {
      doctorId,
      scheduledAt: {
        gte: new Date(interval.from),
        lt: new Date(interval.to),
      },
    },
    include: {
      patient: true,
      doctor: { include: { specialty: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

export const updateAppointmentStatus = (
  id: string,
  data: AppointmentStatusUpdateInput,
) =>
  prisma.appointment.update({
    where: { id },
    data: { status: data.status },
    include: {
      patient: true,
      doctor: { include: { specialty: true } },
    },
  });
