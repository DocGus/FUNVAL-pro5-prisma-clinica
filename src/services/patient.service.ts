
import { Prisma } from "../../generated/prisma/client.js";
import {
  createPatient,
  findAllPatients,
  findPatientById,
} from "../models/patient.model.js";
import type { PatientCreateInput } from "../schemas/patient.schema.js";
import { AppError } from "../utils/app-error.js";

export const registerPatient = async (data: PatientCreateInput) => {
  try {
    return await createPatient(data);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        409,
        "CONFLICT",
        "Ya existe un paciente registrado con ese correo electrónico.",
      );
    }
    throw error;
  }
};

export const listPatients = () => findAllPatients();

export const getPatientRecord = async (id: string) => {
  const patient = await findPatientById(id);

  if (!patient) {
    throw new AppError(404, "NOT_FOUND", "Paciente no encontrado.");
  }

  return patient;
};
