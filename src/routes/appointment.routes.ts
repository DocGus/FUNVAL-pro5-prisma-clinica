import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createAppointmentController,
  updateAppointmentStatusController,
} from "../controllers/appointment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

export const appointmentRouter: ExpressRouter = Router();

appointmentRouter.post(
  "/",
  authenticate,
  authorizeRoles("RECEPCIONISTA"),
  createAppointmentController,
);

appointmentRouter.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("MEDICO"),
  updateAppointmentStatusController,
);
