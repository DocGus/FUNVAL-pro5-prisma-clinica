
import type { RequestHandler } from "express";
import {
  getSharedPatient,
  listDoctors,
  listSpecialties,
} from "../services/doctor.service.js";

export const listDoctorsController: RequestHandler = async (
  _request,
  response,
) => {
  const doctors = await listDoctors(
    response.locals.doctorFilter,
  );

  response.status(200).json(doctors);
};

export const listSpecialtiesController: RequestHandler = async (
  _request,
  response,
) => {
  const specialties = await listSpecialties();

  response.status(200).json(specialties);
};

export const getSharedPatientController: RequestHandler = async (
  request,
  response,
) => {
  const patient = await getSharedPatient(
    request.user!.id,
    request.params.patientId as string,
  );

  response.status(200).json(patient);
};
