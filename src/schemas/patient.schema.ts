
import { z } from "zod";
import { dateSchema, uuidSchema } from "./common.schema.js";

export const patientCreateSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email(),
  birthDate: dateSchema.refine(
    (value) => new Date(`${value}T00:00:00.000Z`) <= new Date(
      new Date().toISOString().slice(0, 10) + "T00:00:00.000Z",
    ),
    "La fecha de nacimiento no puede ser futura.",
  ),
  phone: z.string().optional(),
});

export const patientIdParamsSchema = z.object({
  id: uuidSchema,
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
