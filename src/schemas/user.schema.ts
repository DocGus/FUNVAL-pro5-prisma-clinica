
import { z } from "zod";
import { uuidSchema } from "./common.schema.js";

export const registerReceptionistSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.literal("RECEPCIONISTA"),
});

export const registerDoctorSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.literal("MEDICO"),
  doctorId: uuidSchema,
});

export const registerSchema = z.discriminatedUnion("role", [
  registerReceptionistSchema,
  registerDoctorSchema,
]);

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const userIdParamsSchema = z.object({
  id: uuidSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
