
import {
  findAllDoctors,
} from "../models/doctor.model.js";
import {
  findAllSpecialties,
} from "../models/specialty.model.js";
import {
  findPatientSharedWithDoctor,
} from "../models/patient.model.js";
import { findUserById } from "../models/user.model.js";
import type { DoctorFilterInput } from "../schemas/doctor.schema.js";
import { AppError } from "../utils/app-error.js";

export const listDoctors = (filters: DoctorFilterInput) =>
  findAllDoctors(filters);

export const listSpecialties = () => findAllSpecialties();

export const getSharedPatient = async (
  userId: string,
  patientId: string,
) => {
  const user = await findUserById(userId);

  if (!user?.doctorId) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "La cuenta no está vinculada a un médico.",
    );
  }

  const patient = await findPatientSharedWithDoctor(
    patientId,
    user.doctorId,
  );

  if (!patient) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Paciente o relación asistencial no encontrada.",
    );
  }

  return patient;
};
