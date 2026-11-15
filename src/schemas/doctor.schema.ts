
import { z } from "zod";
import { uuidSchema } from "./common.schema.js";

export const doctorIdParamsSchema = z.object({
  id: uuidSchema,
});

export const doctorPatientParamsSchema = z.object({
  patientId: uuidSchema,
});

export const doctorFilterSchema = z.object({
  specialtyId: uuidSchema.optional(),
});

export type DoctorFilterInput = z.infer<typeof doctorFilterSchema>;
