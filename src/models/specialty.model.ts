import { prisma } from "../config/prisma.js";

export const findAllSpecialties = () =>
  prisma.specialty.findMany({
    orderBy: { name: "asc" },
  });
