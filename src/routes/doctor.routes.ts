
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  getSharedPatientController,
  listDoctorsController,
  listSpecialtiesController,
} from "../controllers/doctor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { getDoctorAgendaController } from "../controllers/appointment.controller.js";
import { doctorFilterSchema } from "../schemas/doctor.schema.js";
import { AppError } from "../utils/app-error.js";

export const doctorRouter: ExpressRouter = Router();

doctorRouter.get(
  "/",
  authenticate,
  authorizeRoles("RECEPCIONISTA"),
  (request, _response, next) => {
    const result = doctorFilterSchema.safeParse(request.query);
    if (!result.success) {
      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "El filtro de especialidad no es válido.",
        ),
      );
      return;
    }
    request.query = result.data;
    next();
  },
  listDoctorsController,
);

doctorRouter.get(
  "/me/patients/:patientId",
  authenticate,
  authorizeRoles("MEDICO"),
  getSharedPatientController,
);

export const specialtyRouter: ExpressRouter = Router();

specialtyRouter.get(
  "/",
  authenticate,
  authorizeRoles("RECEPCIONISTA"),
  listSpecialtiesController,
);
