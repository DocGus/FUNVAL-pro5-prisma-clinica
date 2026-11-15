
import { z } from "zod";
import { dateSchema, uuidSchema } from "./common.schema.js";

export const patientCreateSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email(),
  birthDate: dateSchema,
  phone: z.string().optional(),
});

export const patientIdParamsSchema = z.object({
  id: uuidSchema,
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
