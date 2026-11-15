
import { z } from "zod";
import {
  dateTimeSchema,
  uuidSchema,
} from "./common.schema.js";

export const appointmentCreateSchema = z.object({
  patientId: uuidSchema,
  doctorId: uuidSchema,
  scheduledAt: dateTimeSchema,
  reason: z.string().optional(),
});

export const appointmentIdParamsSchema = z.object({
  id: uuidSchema,
});

export const doctorAppointmentsParamsSchema = z.object({
  id: uuidSchema,
});

export const appointmentStatusUpdateSchema = z.object({
  status: z.enum(["COMPLETADA", "CANCELADA"]),
});

export const appointmentIntervalQuerySchema = z
  .object({
    from: dateTimeSchema,
    to: dateTimeSchema,
  })
  .refine(
    (data) => new Date(data.from) < new Date(data.to),
    {
      message: "La fecha inicial debe ser anterior a la fecha final",
      path: ["to"],
    },
  );

export type AppointmentCreateInput = z.infer<
  typeof appointmentCreateSchema
>;

export type AppointmentStatusUpdateInput = z.infer<
  typeof appointmentStatusUpdateSchema
>;

export type AppointmentIntervalQuery = z.infer<
  typeof appointmentIntervalQuerySchema
>;
