import { z } from "zod";
import { uuidSchema } from "./common.schema.js";

export const doctorIdParamsSchema = z.object({
  id: uuidSchema,
});

export const doctorPatientParamsSchema = z.object({
  patientId: uuidSchema,
});

export const doctorFilterSchema = z.object({
  specialty: z.string().trim().min(1).optional(),
});

export type DoctorFilterInput = z.infer<typeof doctorFilterSchema>;
