import { prisma } from "../config/prisma.js";

export interface AppointmentsBySpecialtyRow {
  specialtyId: string;
  name: string;
  totalAppointments: number;
}

export interface DailyCutoffRow {
  status: "COMPLETADA" | "CANCELADA";
  total: number;
}

export const getAppointmentsBySpecialty = () =>
  prisma.$queryRaw<AppointmentsBySpecialtyRow[]>`
    SELECT
      s."id" AS "specialtyId",
      s."name" AS "name",
      COUNT(a."id")::int AS "totalAppointments"
    FROM "Specialty" s
    INNER JOIN "Doctor" d ON d."specialtyId" = s."id"
    INNER JOIN "Appointment" a ON a."doctorId" = d."id"
    GROUP BY s."id", s."name"
    ORDER BY COUNT(a."id") DESC
  `;

export const getDailyCutoff = (date: string) => {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return prisma.$queryRaw<DailyCutoffRow[]>`
    SELECT
      a."status" AS "status",
      COUNT(*)::int AS "total"
    FROM "Appointment" a
    WHERE
      a."startAt" >= ${start}
      AND a."startAt" < ${end}
      AND a."status" IN ('COMPLETADA', 'CANCELADA')
    GROUP BY a."status"
  `;
};
