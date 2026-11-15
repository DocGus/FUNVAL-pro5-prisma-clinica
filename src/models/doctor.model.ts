
import { prisma } from "../config/prisma.js";
import type { DoctorFilterInput } from "../schemas/doctor.schema.js";

export const findAllDoctors = (filters: DoctorFilterInput = {}) =>
  prisma.doctor.findMany({
    ...(filters.specialty
      ? {
          where: {
            specialty: {
              name: {
                equals: filters.specialty,
                mode: "insensitive" as const,
              },
            },
          },
        }
      : {}),
    include: {
      specialty: true,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

export const findDoctorById = (id: string) =>
  prisma.doctor.findUnique({
    where: { id },
    include: {
      specialty: true,
    },
  });
