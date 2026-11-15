
import { prisma } from "../config/prisma.js";
import type { PatientCreateInput } from "../schemas/patient.schema.js";

export const createPatient = (data: PatientCreateInput) =>
  prisma.patient.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.trim().toLowerCase(),
      birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    },
  });

export const findAllPatients = () =>
  prisma.patient.findMany({
    orderBy: { id: "asc" },
  });

export const findPatientById = (id: string) =>
  prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { scheduledAt: "desc" },
        include: {
          doctor: {
            include: { specialty: true },
          },
        },
      },
    },
  });

export const findPatientSharedWithDoctor = (
  patientId: string,
  doctorId: string,
) =>
  prisma.patient.findFirst({
    where: {
      id: patientId,
      appointments: {
        some: { doctorId },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      appointments: {
        where: { doctorId },
        orderBy: { scheduledAt: "desc" },
        select: {
          id: true,
          scheduledAt: true,
          reason: true,
          status: true,
        },
      },
    },
  });
