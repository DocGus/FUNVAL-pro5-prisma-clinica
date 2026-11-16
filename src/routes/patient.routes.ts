
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createPatientController,
  getPatientController,
  listPatientsController,
} from "../controllers/patient.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  patientCreateSchema,
  patientIdParamsSchema,
} from "../schemas/patient.schema.js";
import { AppError } from "../utils/app-error.js";

export const patientRouter: ExpressRouter = Router();

patientRouter.use(authenticate, authorizeRoles("RECEPCIONISTA"));

patientRouter.post(
  "/",
  validateBody(patientCreateSchema),
  createPatientController,
);

patientRouter.get("/", listPatientsController);

patientRouter.get(
  "/:id",
  (request, _response, next) => {
    const result = patientIdParamsSchema.safeParse(request.params);

    if (!result.success) {
      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Identificador de paciente inválido.",
        ),
      );
      return;
    }

    next();
  },
  getPatientController,
);
