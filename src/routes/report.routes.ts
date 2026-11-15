import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  appointmentsBySpecialtyController,
  dailyCutoffController,
} from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

export const reportRouter: ExpressRouter = Router();

reportRouter.get(
  "/appointments-by-specialty",
  authenticate,
  authorizeRoles("GERENCIA"),
  appointmentsBySpecialtyController,
);

reportRouter.get(
  "/daily-cutoff",
  authenticate,
  authorizeRoles("GERENCIA"),
  dailyCutoffController,
);
