
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  getSharedPatientController,
  listDoctorsController,
  listSpecialtiesController,
} from "../controllers/doctor.controller.js";
import { getDoctorAgendaController } from "../controllers/appointment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  doctorFilterSchema,
  doctorPatientParamsSchema,
} from "../schemas/doctor.schema.js";
import { doctorAppointmentsParamsSchema } from "../schemas/appointment.schema.js";
import { AppError } from "../utils/app-error.js";

export const doctorRouter: ExpressRouter = Router();

doctorRouter.get(
  "/",
  authenticate,
  authorizeRoles("RECEPCIONISTA"),
  (request, response, next) => {
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

    response.locals.doctorFilter = result.data;
    next();
  },
  listDoctorsController,
);

doctorRouter.get(
  "/me/patients/:patientId",
  authenticate,
  authorizeRoles("MEDICO"),
  (request, response, next) => {
    const result = doctorPatientParamsSchema.safeParse(request.params);

    if (!result.success) {
      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "El identificador del paciente no es válido.",
        ),
      );
      return;
    }

    next();
  },
  getSharedPatientController,
);

doctorRouter.get(
  "/:id/appointments",
  authenticate,
  authorizeRoles("MEDICO"),
  (request, response, next) => {
    const result = doctorAppointmentsParamsSchema.safeParse(request.params);

    if (!result.success) {
      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "El identificador del médico no es válido.",
        ),
      );
      return;
    }

    next();
  },
  getDoctorAgendaController,
);

export const specialtyRouter: ExpressRouter = Router();

specialtyRouter.get(
  "/",
  authenticate,
  authorizeRoles("RECEPCIONISTA"),
  listSpecialtiesController,
);
