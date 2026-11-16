import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/user.model.js", () => ({
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
  createDoctorUser: vi.fn(),
}));
vi.mock("../src/models/patient.model.js", () => ({
  createPatient: vi.fn(),
  findAllPatients: vi.fn(),
  findPatientById: vi.fn(),
  findPatientSharedWithDoctor: vi.fn(),
}));
vi.mock("../src/models/doctor.model.js", () => ({
  findAllDoctors: vi.fn(),
  findDoctorById: vi.fn(),
}));
vi.mock("../src/models/specialty.model.js", () => ({
  findAllSpecialties: vi.fn(),
}));
vi.mock("../src/models/appointment.model.js", () => ({
  createAppointment: vi.fn(),
  findAppointmentById: vi.fn(),
  findAppointmentConflict: vi.fn(),
  findAppointmentsByDoctor: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}));
vi.mock("../src/models/report.model.js", () => ({
  getAppointmentsBySpecialty: vi.fn(),
  getDailyCutoff: vi.fn(),
}));

import { app } from "../src/app.js";
import {
  createDoctorUser,
  createUser,
  findUserByEmail,
  findUserById,
} from "../src/models/user.model.js";
import {
  createPatient,
  findAllPatients,
  findPatientById,
  findPatientSharedWithDoctor,
} from "../src/models/patient.model.js";
import {
  findAllDoctors,
  findDoctorById,
} from "../src/models/doctor.model.js";
import { findAllSpecialties } from "../src/models/specialty.model.js";
import {
  createAppointment,
  findAppointmentById,
  findAppointmentConflict,
  findAppointmentsByDoctor,
  updateAppointmentStatus,
} from "../src/models/appointment.model.js";
import {
  getAppointmentsBySpecialty,
  getDailyCutoff,
} from "../src/models/report.model.js";

const secret = "unit-test-secret-not-for-production";
const patientId = "91fca82b-d557-45fd-85b4-92fe7aa8c9dd";
const otherPatientId = "7de3b9cb-3984-4950-9710-f9845660d82c";
const doctorId = "297f0c17-6a00-40c6-8e54-bbbb8a0569f7";
const otherDoctorId = "4cd8722d-a20a-43b3-807c-6bd8ed36521b";
const appointmentId = "1f077cbd-a854-478b-829a-d2fd4098a46c";

const auth = (
  role: "GERENCIA" | "RECEPCIONISTA" | "MEDICO",
  id = "d550a2f6-68a1-4cc9-b84d-becdd02d0001",
) => `Bearer ${jwt.sign({ id, email: `${role.toLowerCase()}@test.invalid`, role }, secret)}`;

const futureDateTime = () =>
  new Date(Date.now() + 60 * 60 * 1000).toISOString();

const doctor = {
  id: doctorId,
  firstName: "Miguel",
  lastName: "Herrera",
  professionalLicense: "TEST-MED-001",
  email: "miguel@example.test",
  specialtyId: "92eb5e68-41e2-49c9-9c13-bc648a050001",
};

const patient = {
  id: patientId,
  firstName: "Carlos",
  lastName: "Prueba",
  email: "carlos@example.test",
  birthDate: "1990-05-20",
};

const scheduledAppointment = {
  id: appointmentId,
  patientId,
  doctorId,
  scheduledAt: "2026-12-01T16:00:00.000Z",
  reason: null,
  status: "PROGRAMADA",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(findUserByEmail).mockResolvedValue(null as never);
  vi.mocked(findUserById).mockResolvedValue(null as never);
  vi.mocked(createUser).mockResolvedValue({
    id: "d550a2f6-68a1-4cc9-b84d-becdd02d0002",
    email: "recepcionista@example.test",
    role: "RECEPCIONISTA",
  } as never);
  vi.mocked(createDoctorUser).mockResolvedValue({
    status: "CREATED",
    user: {
      id: "d550a2f6-68a1-4cc9-b84d-becdd02d0003",
      email: "medico@example.test",
      role: "MEDICO",
    },
  } as never);
  vi.mocked(createPatient).mockResolvedValue(patient as never);
  vi.mocked(findAllPatients).mockResolvedValue([] as never);
  vi.mocked(findPatientById).mockResolvedValue(patient as never);
  vi.mocked(findPatientSharedWithDoctor).mockResolvedValue({
    id: patientId,
    firstName: patient.firstName,
    lastName: patient.lastName,
    birthDate: patient.birthDate,
    appointments: [{ ...scheduledAppointment, doctorId }],
  } as never);
  vi.mocked(findAllDoctors).mockResolvedValue([] as never);
  vi.mocked(findDoctorById).mockResolvedValue(doctor as never);
  vi.mocked(findAllSpecialties).mockResolvedValue([] as never);
  vi.mocked(createAppointment).mockResolvedValue(
    scheduledAppointment as never,
  );
  vi.mocked(findAppointmentById).mockResolvedValue(
    scheduledAppointment as never,
  );
  vi.mocked(findAppointmentConflict).mockResolvedValue(null as never);
  vi.mocked(findAppointmentsByDoctor).mockResolvedValue(
    [scheduledAppointment] as never,
  );
  vi.mocked(updateAppointmentStatus).mockImplementation(
    (_id, data) =>
      Promise.resolve({ ...scheduledAppointment, status: data.status }) as never,
  );
  vi.mocked(getAppointmentsBySpecialty).mockResolvedValue([] as never);
  vi.mocked(getDailyCutoff).mockResolvedValue([] as never);
});

describe("autenticación, registro y autorización", () => {
  it("normaliza el email al iniciar sesión y no expone el hash", async () => {
    const passwordHash = await bcrypt.hash("SafeTestPassword-123", 4);
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: "d550a2f6-68a1-4cc9-b84d-becdd02d0010",
      email: "recepcionista@example.test",
      passwordHash,
      role: "RECEPCIONISTA",
      doctorId: null,
    } as never);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: " RECEPCIONISTA@example.test ", password: "SafeTestPassword-123" })
      .expect(200);

    expect(jwt.verify(response.body.token as string, secret)).toMatchObject({
      id: "d550a2f6-68a1-4cc9-b84d-becdd02d0010",
      role: "RECEPCIONISTA",
    });
    expect(response.body).not.toHaveProperty("passwordHash");
  });

  it("rechaza credenciales incorrectas y cuerpos de login inválidos", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@example.test", password: "SafeTestPassword-123" })
      .expect(401);
    await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "" })
      .expect(400);
  });

  it("normaliza el email al registrar y limita el registro a GERENCIA", async () => {
    const body = {
      email: "  Nueva.Recepcion@example.test  ",
      password: "SafeTestPassword-123",
      role: "RECEPCIONISTA",
    };

    await request(app).post("/api/auth/register").send(body).expect(401);
    await request(app)
      .post("/api/auth/register")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send(body)
      .expect(403);

    const response = await request(app)
      .post("/api/auth/register")
      .set("Authorization", auth("GERENCIA"))
      .send(body)
      .expect(201);

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "nueva.recepcion@example.test" }),
      expect.any(String),
    );
    expect(response.body).not.toHaveProperty("passwordHash");
    expect(response.body).not.toHaveProperty("password");
  });

  it("valida restricciones del rol y referencias del registro MEDICO", async () => {
    await request(app)
      .post("/api/auth/register")
      .set("Authorization", auth("GERENCIA"))
      .send({ email: "gerencia@example.test", password: "SafeTestPassword-123", role: "GERENCIA" })
      .expect(400);

    vi.mocked(createDoctorUser).mockResolvedValueOnce({
      status: "DOCTOR_NOT_FOUND",
    } as never);
    await request(app)
      .post("/api/auth/register")
      .set("Authorization", auth("GERENCIA"))
      .send({
        email: "medico@example.test",
        password: "SafeTestPassword-123",
        role: "MEDICO",
        doctorId,
      })
      .expect(404);

    vi.mocked(createDoctorUser).mockResolvedValueOnce({
      status: "DOCTOR_ALREADY_LINKED",
    } as never);
    await request(app)
      .post("/api/auth/register")
      .set("Authorization", auth("GERENCIA"))
      .send({
        email: "medico@example.test",
        password: "SafeTestPassword-123",
        role: "MEDICO",
        doctorId,
      })
      .expect(409);
  });

  it("rechaza un correo ya registrado", async () => {
    vi.mocked(findUserByEmail).mockResolvedValueOnce({
      id: "d550a2f6-68a1-4cc9-b84d-becdd02d0020",
      email: "recepcionista@example.test",
    } as never);

    await request(app)
      .post("/api/auth/register")
      .set("Authorization", auth("GERENCIA"))
      .send({
        email: "recepcionista@example.test",
        password: "SafeTestPassword-123",
        role: "RECEPCIONISTA",
      })
      .expect(409);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("rechaza tokens inválidos y rol no autorizado", async () => {
    await request(app).get("/api/patients").expect(401);
    await request(app)
      .get("/api/patients")
      .set("Authorization", "Bearer invalid")
      .expect(401);
    await request(app)
      .get("/api/reports/appointments-by-specialty")
      .set("Authorization", auth("MEDICO"))
      .expect(403);
  });
});

describe("pacientes, médicos y especialidades", () => {
  it("registra pacientes y valida email y fecha de nacimiento", async () => {
    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send({
        firstName: "Carlos",
        lastName: "Prueba",
        email: "carlos@example.test",
        birthDate: "1990-05-20",
      })
      .expect(201);
    expect(response.body.id).toBe(patientId);

    await request(app)
      .post("/api/patients")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send({ firstName: "A", lastName: "B", email: "invalid", birthDate: "2999-01-01" })
      .expect(400);
  });

  it("lista y consulta pacientes, con 400/404 para identificadores", async () => {
    vi.mocked(findAllPatients).mockResolvedValueOnce([patient] as never);
    const list = await request(app)
      .get("/api/patients")
      .set("Authorization", auth("RECEPCIONISTA"))
      .expect(200);
    expect(list.body).toHaveLength(1);

    await request(app)
      .get("/api/patients/not-a-uuid")
      .set("Authorization", auth("RECEPCIONISTA"))
      .expect(400);
    vi.mocked(findPatientById).mockResolvedValueOnce(null as never);
    await request(app)
      .get(`/api/patients/${otherPatientId}`)
      .set("Authorization", auth("RECEPCIONISTA"))
      .expect(404);
  });

  it("filtra el directorio por especialidad y rechaza filtros inválidos", async () => {
    const response = await request(app)
      .get(`/api/doctors?specialtyId=${doctor.specialtyId}`)
      .set("Authorization", auth("RECEPCIONISTA"))
      .expect(200);
    expect(response.body).toEqual([]);
    expect(findAllDoctors).toHaveBeenCalledWith({ specialtyId: doctor.specialtyId });

    await request(app)
      .get("/api/doctors?specialtyId=invalid")
      .set("Authorization", auth("RECEPCIONISTA"))
      .expect(400);
  });

  it("consulta el catálogo de especialidades y protege roles", async () => {
    vi.mocked(findAllSpecialties).mockResolvedValueOnce([
      { id: doctor.specialtyId, name: "Cardiología" },
    ] as never);
    const response = await request(app)
      .get("/api/specialties")
      .set("Authorization", auth("RECEPCIONISTA"))
      .expect(200);
    expect(response.body[0].name).toBe("Cardiología");
    await request(app)
      .get("/api/specialties")
      .set("Authorization", auth("MEDICO"))
      .expect(403);
  });

  it("devuelve solo los campos básicos y citas compartidas del paciente", async () => {
    vi.mocked(findUserById).mockResolvedValueOnce({ id: "doctor-user", doctorId } as never);
    const response = await request(app)
      .get(`/api/doctors/me/patients/${patientId}`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(200);
    expect(response.body).not.toHaveProperty("email");
    expect(response.body.appointments).toHaveLength(1);
    expect(findPatientSharedWithDoctor).toHaveBeenCalledWith(patientId, doctorId);
    await request(app)
      .get("/api/doctors/me/patients/not-a-uuid")
      .set("Authorization", auth("MEDICO"))
      .expect(400);

    vi.mocked(findUserById).mockResolvedValueOnce({ id: "doctor-user", doctorId } as never);
    vi.mocked(findPatientSharedWithDoctor).mockResolvedValueOnce(null as never);
    await request(app)
      .get(`/api/doctors/me/patients/${otherPatientId}`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(404);
  });
});

describe("citas, agenda y transiciones", () => {
  it("crea citas futuras y rechaza fecha inválida, pasada y referencias inexistentes", async () => {
    const body = {
      patientId,
      doctorId,
      scheduledAt: futureDateTime(),
      reason: "Consulta de prueba",
    };
    await request(app)
      .post("/api/appointments")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send(body)
      .expect(201);

    await request(app)
      .post("/api/appointments")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send({ ...body, scheduledAt: "not-a-date" })
      .expect(400);
    await request(app)
      .post("/api/appointments")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send({ ...body, scheduledAt: "2000-01-01T00:00:00.000Z" })
      .expect(400);

    vi.mocked(findPatientById).mockResolvedValueOnce(null as never);
    await request(app)
      .post("/api/appointments")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send(body)
      .expect(404);
    vi.mocked(findDoctorById).mockResolvedValueOnce(null as never);
    await request(app)
      .post("/api/appointments")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send(body)
      .expect(404);
  });

  it("rechaza conflictos de paciente o médico", async () => {
    vi.mocked(findAppointmentConflict).mockResolvedValueOnce({ id: appointmentId } as never);
    await request(app)
      .post("/api/appointments")
      .set("Authorization", auth("RECEPCIONISTA"))
      .send({ patientId, doctorId, scheduledAt: futureDateTime() })
      .expect(409);
    expect(createAppointment).not.toHaveBeenCalled();
  });

  it("consulta agenda propia, respeta intervalo y valida sus parámetros", async () => {
    vi.mocked(findUserById).mockResolvedValueOnce({ id: "doctor-user", doctorId } as never);
    const response = await request(app)
      .get(`/api/doctors/${doctorId}/appointments?from=2026-12-01T16:00:00.000Z&to=2026-12-02T00:00:00.000Z`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(200);
    expect(response.body).toHaveLength(1);
    expect(findAppointmentsByDoctor).toHaveBeenCalledWith(doctorId, {
      from: "2026-12-01T16:00:00.000Z",
      to: "2026-12-02T00:00:00.000Z",
    });

    await request(app)
      .get(`/api/doctors/${doctorId}/appointments?from=2026-12-02T00:00:00.000Z&to=2026-12-01T00:00:00.000Z`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(400);
    await request(app)
      .get(`/api/doctors/${doctorId}/appointments?from=invalid&to=2026-12-02T00:00:00.000Z`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(400);
    await request(app)
      .get(`/api/doctors/${doctorId}/appointments?from=2026-12-01T00:00:00.000Z`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(400);
    await request(app)
      .get("/api/doctors/not-a-uuid/appointments?from=2026-12-01T00:00:00.000Z&to=2026-12-02T00:00:00.000Z")
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(400);
  });

  it("distingue médico inexistente de agenda ajena", async () => {
    vi.mocked(findDoctorById).mockResolvedValueOnce(null as never);
    await request(app)
      .get(`/api/doctors/${otherDoctorId}/appointments?from=2026-12-01T00:00:00.000Z&to=2026-12-02T00:00:00.000Z`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(404);

    vi.mocked(findUserById).mockResolvedValueOnce({ id: "doctor-user", doctorId } as never);
    await request(app)
      .get(`/api/doctors/${otherDoctorId}/appointments?from=2026-12-01T00:00:00.000Z&to=2026-12-02T00:00:00.000Z`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .expect(403);
  });

  it.each(["COMPLETADA", "CANCELADA"] as const)(
    "permite la transición PROGRAMADA → %s en una cita propia",
    async (status) => {
      vi.mocked(findUserById).mockResolvedValueOnce({
        id: "doctor-user",
        role: "MEDICO",
        doctorId,
      } as never);
      vi.mocked(findAppointmentById).mockResolvedValueOnce(
        scheduledAppointment as never,
      );
      vi.mocked(updateAppointmentStatus).mockResolvedValueOnce({
        ...scheduledAppointment,
        status,
      } as never);

      const response = await request(app)
        .patch(`/api/appointments/${appointmentId}/status`)
        .set("Authorization", auth("MEDICO", "doctor-user"))
        .send({ status })
        .expect(200);
      expect(response.body.status).toBe(status);
    },
  );

  it("rechaza estados finales, citas ajenas, inexistentes e identificadores/cuerpos inválidos", async () => {
    vi.mocked(findUserById).mockResolvedValue({
      id: "doctor-user",
      role: "MEDICO",
      doctorId,
    } as never);
    vi.mocked(findAppointmentById).mockResolvedValue({
      ...scheduledAppointment,
      status: "COMPLETADA",
    } as never);
    await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .send({ status: "CANCELADA" })
      .expect(409);

    vi.mocked(findAppointmentById).mockResolvedValue({
      ...scheduledAppointment,
      doctorId: otherDoctorId,
    } as never);
    await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .send({ status: "COMPLETADA" })
      .expect(403);

    vi.mocked(findAppointmentById).mockResolvedValue(null as never);
    await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .send({ status: "COMPLETADA" })
      .expect(404);

    await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .send({ status: "PROGRAMADA" })
      .expect(400);
    await request(app)
      .patch("/api/appointments/not-a-uuid/status")
      .set("Authorization", auth("MEDICO", "doctor-user"))
      .send({ status: "COMPLETADA" })
      .expect(400);

    vi.mocked(findUserById).mockResolvedValueOnce({
      id: "reception-user",
      role: "RECEPCIONISTA",
      doctorId: null,
    } as never);
    vi.mocked(findAppointmentById).mockResolvedValueOnce(
      scheduledAppointment as never,
    );
    await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", auth("RECEPCIONISTA", "reception-user"))
      .send({ status: "COMPLETADA" })
      .expect(200);
  });

  it.each(["COMPLETADA", "CANCELADA"] as const)(
    "permite a RECEPCIONISTA cambiar PROGRAMADA a %s",
    async (status) => {
      vi.mocked(findUserById).mockResolvedValueOnce({
        id: "reception-user",
        role: "RECEPCIONISTA",
        doctorId: null,
      } as never);
      vi.mocked(findAppointmentById).mockResolvedValueOnce(
        scheduledAppointment as never,
      );
      vi.mocked(updateAppointmentStatus).mockResolvedValueOnce({
        ...scheduledAppointment,
        status,
      } as never);

      const response = await request(app)
        .patch(`/api/appointments/${appointmentId}/status`)
        .set("Authorization", auth("RECEPCIONISTA", "reception-user"))
        .send({ status })
        .expect(200);

      expect(response.body.status).toBe(status);
    },
  );

  it("permite a RECEPCIONISTA actualizar una cita de otro médico", async () => {
    vi.mocked(findUserById).mockResolvedValueOnce({
      id: "reception-user",
      role: "RECEPCIONISTA",
      doctorId: null,
    } as never);
    vi.mocked(findAppointmentById).mockResolvedValueOnce({
      ...scheduledAppointment,
      doctorId: otherDoctorId,
    } as never);

    const response = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", auth("RECEPCIONISTA", "reception-user"))
      .send({ status: "COMPLETADA" })
      .expect(200);

    expect(response.body.status).toBe("COMPLETADA");
    expect(updateAppointmentStatus).toHaveBeenCalledWith(
      appointmentId,
      { status: "COMPLETADA" },
    );
  });

  it.each([
    ["COMPLETADA", "CANCELADA"],
    ["CANCELADA", "COMPLETADA"],
  ] as const)(
    "rechaza a RECEPCIONISTA modificar una cita finalizada (%s)",
    async (finalStatus, requestedStatus) => {
      vi.mocked(findUserById).mockResolvedValueOnce({
        id: "reception-user",
        role: "RECEPCIONISTA",
        doctorId: null,
      } as never);
      vi.mocked(findAppointmentById).mockResolvedValueOnce({
        ...scheduledAppointment,
        status: finalStatus,
      } as never);

      await request(app)
        .patch(`/api/appointments/${appointmentId}/status`)
        .set("Authorization", auth("RECEPCIONISTA", "reception-user"))
        .send({ status: requestedStatus })
        .expect(409);

      expect(updateAppointmentStatus).not.toHaveBeenCalled();
    },
  );

  it("rechaza a GERENCIA al intentar actualizar el estado de una cita", async () => {
    await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", auth("GERENCIA"))
      .send({ status: "COMPLETADA" })
      .expect(403);
  });
});

describe("reportes administrativos", () => {
  it("devuelve el reporte por especialidad y restringe el acceso", async () => {
    vi.mocked(getAppointmentsBySpecialty).mockResolvedValueOnce([
      { specialtyId: doctor.specialtyId, name: "Cardiología", totalAppointments: 4 },
    ] as never);
    const response = await request(app)
      .get("/api/reports/appointments-by-specialty")
      .set("Authorization", auth("GERENCIA"))
      .expect(200);
    expect(response.body[0].totalAppointments).toBe(4);
    await request(app)
      .get("/api/reports/appointments-by-specialty")
      .set("Authorization", auth("RECEPCIONISTA"))
      .expect(403);
  });

  it("completa con cero los estados ausentes y rechaza fechas inválidas", async () => {
    vi.mocked(getDailyCutoff).mockResolvedValueOnce([
      { status: "COMPLETADA", total: 2 },
    ] as never);
    const response = await request(app)
      .get("/api/reports/daily-cutoff?date=2026-12-01")
      .set("Authorization", auth("GERENCIA"))
      .expect(200);
    expect(response.body).toEqual({
      date: "2026-12-01",
      counts: { COMPLETADA: 2, CANCELADA: 0 },
    });

    await request(app)
      .get("/api/reports/daily-cutoff?date=2026-02-30")
      .set("Authorization", auth("GERENCIA"))
      .expect(400);
    await request(app)
      .get("/api/reports/daily-cutoff?date=2026-12-01")
      .set("Authorization", auth("MEDICO"))
      .expect(403);
  });
});
