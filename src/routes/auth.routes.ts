import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
} from "../schemas/user.schema.js";

export const authRouter: ExpressRouter = Router();

authRouter.post(
  "/login",
  validateBody(loginSchema),
  loginController,
);

authRouter.post(
  "/register",
  authenticate,
  authorizeRoles("GERENCIA"),
  validateBody(registerSchema),
  registerController,
);
