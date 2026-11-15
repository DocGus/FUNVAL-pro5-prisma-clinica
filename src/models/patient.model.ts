import { prisma } from "../config/prisma.js";
import type { PatientCreateInput } from "../schemas/patient.schema.js";

export const createPatient = (data: PatientCreateInput) =>
  prisma.patient.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    },
  });

export const findAllPatients = () =>
  prisma.patient.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
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
