import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  patient: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn() },
  doctor: { findMany: vi.fn(), findUnique: vi.fn() },
  specialty: { findMany: vi.fn() },
  appointment: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  user: { findUnique: vi.fn(), create: vi.fn() },
  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
}));

vi.mock("../src/config/prisma.js", () => ({ prisma: prismaMock }));

import { createAppointment, findAppointmentConflict, findAppointmentsByDoctor } from "../src/models/appointment.model.js";
import { findPatientSharedWithDoctor } from "../src/models/patient.model.js";
import { findAllDoctors } from "../src/models/doctor.model.js";
import { getAppointmentsBySpecialty, getDailyCutoff } from "../src/models/report.model.js";
import { prisma } from "../src/config/prisma.js";

const patientId = "91fca82b-d557-45fd-85b4-92fe7aa8c9dd";
const doctorId = "297f0c17-6a00-40c6-8e54-bbbb8a0569f7";
const specialtyId = "92eb5e68-41e2-49c9-9c13-bc648a050001";

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(prisma.patient.findFirst).mockResolvedValue(null as never);
  vi.mocked(prisma.doctor.findMany).mockResolvedValue([] as never);
  vi.mocked(prisma.appointment.create).mockResolvedValue({} as never);
  vi.mocked(prisma.appointment.findFirst).mockResolvedValue(null as never);
  vi.mocked(prisma.appointment.findMany).mockResolvedValue([] as never);
  vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never);
});

describe("consultas de modelos Prisma", () => {
  it("filtra el directorio y relaciona Specialty", async () => {
    await findAllDoctors({ specialtyId });
    expect(prisma.doctor.findMany).toHaveBeenCalledWith({
      where: { specialtyId },
      include: { specialty: true },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
        { id: "asc" },
      ],
    });
  });

  it("limita pacientes compartidos al médico y excluye el email", async () => {
    await findPatientSharedWithDoctor(patientId, doctorId);
    expect(prisma.patient.findFirst).toHaveBeenCalledWith({
      where: {
        id: patientId,
        appointments: { some: { doctorId } },
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
  });

  it("usa un intervalo semiabierto en la agenda [from, to)", async () => {
    const interval = {
      from: "2026-12-01T16:00:00.000Z",
      to: "2026-12-02T00:00:00.000Z",
    };
    await findAppointmentsByDoctor(doctorId, interval);
    expect(prisma.appointment.findMany).toHaveBeenCalledWith({
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
  });

  it("crea una cita sin enviar status y consulta conflictos por paciente o médico", async () => {
    const scheduledAt = "2026-12-01T16:00:00.000Z";
    await createAppointment({
      patientId,
      doctorId,
      scheduledAt,
      reason: "Consulta",
    });
    expect(prisma.appointment.create).toHaveBeenCalledWith({
      data: {
        patientId,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        reason: "Consulta",
      },
      include: {
        patient: true,
        doctor: { include: { specialty: true } },
      },
    });

    const instant = new Date(scheduledAt);
    await findAppointmentConflict(patientId, doctorId, instant);
    expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
      where: { scheduledAt: instant, OR: [{ patientId }, { doctorId }] },
      select: { id: true },
    });
  });
});

describe("consultas de reportes", () => {
  it("agrupa el reporte por especialidad en orden descendente", async () => {
    await getAppointmentsBySpecialty();
    const [query] = vi.mocked(prisma.$queryRaw).mock.calls[0] ?? [];
    const sql = Array.from(query as TemplateStringsArray).join("?");
    expect(sql).toContain('FROM "Specialty" s');
    expect(sql).toContain('INNER JOIN "Doctor" d');
    expect(sql).toContain('INNER JOIN "Appointment" a');
    expect(sql).toContain('GROUP BY s."id", s."name"');
    expect(sql).toContain('ORDER BY COUNT(a."id") DESC');
  });

  it("consulta estados del día con límites UTC [inicio, siguiente día)", async () => {
    await getDailyCutoff("2026-12-01");
    const [query, start, end] = vi.mocked(prisma.$queryRaw).mock.calls[0] ?? [];
    const sql = Array.from(query as TemplateStringsArray).join("?");
    expect(sql).toContain('a."startAt" >= ?');
    expect(sql).toContain('a."startAt" < ?');
    expect(sql).toContain("'COMPLETADA'");
    expect(sql).toContain("'CANCELADA'");
    expect(start).toEqual(new Date("2026-12-01T00:00:00.000Z"));
    expect(end).toEqual(new Date("2026-12-02T00:00:00.000Z"));
  });
});
