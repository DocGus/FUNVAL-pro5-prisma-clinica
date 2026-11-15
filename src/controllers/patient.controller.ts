
import type { RequestHandler } from "express";
import {
  getPatientRecord,
  listPatients,
  registerPatient,
} from "../services/patient.service.js";

export const createPatientController: RequestHandler = async (
  request,
  response,
) => {
  const patient = await registerPatient(request.body);
  response.status(201).json(patient);
};

export const listPatientsController: RequestHandler = async (
  _request,
  response,
) => {
  const patients = await listPatients();
  response.status(200).json(patients);
};

export const getPatientController: RequestHandler = async (
  request,
  response,
) => {
  const patient = await getPatientRecord(request.params.id as string);
  response.status(200).json(patient);
};
