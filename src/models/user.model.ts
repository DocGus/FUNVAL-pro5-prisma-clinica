import { prisma } from "../config/prisma.js";
import type { RegisterInput } from "../schemas/user.schema.js";

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: { email },
  });

export const findUserById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      doctorId: true,
    },
  });

export const createUser = (data: RegisterInput, passwordHash: string) =>
  prisma.user.create({
    data:
      data.role === "MEDICO"
        ? {
            email: data.email,
            passwordHash,
            role: data.role,
            doctorId: data.doctorId,
          }
        : {
            email: data.email,
            passwordHash,
            role: data.role,
          },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

export const createDoctorUser = (
  data: Extract<RegisterInput, { role: "MEDICO" }>,
  passwordHash: string,
) =>
  prisma.$transaction(async (transaction) => {
    const doctor = await transaction.doctor.findUnique({
      where: { id: data.doctorId },
      select: { id: true },
    });

    if (!doctor) {
      return { status: "DOCTOR_NOT_FOUND" as const };
    }

    const linkedUser = await transaction.user.findUnique({
      where: { doctorId: data.doctorId },
      select: { id: true },
    });

    if (linkedUser) {
      return { status: "DOCTOR_ALREADY_LINKED" as const };
    }

    const user = await transaction.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: "MEDICO",
        doctorId: data.doctorId,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return { status: "CREATED" as const, user };
  });
