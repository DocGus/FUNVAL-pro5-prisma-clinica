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
      doctorId: true,
    },
  });
