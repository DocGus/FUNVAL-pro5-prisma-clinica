import { z } from "zod";

export const uuidSchema = z.uuid();

export const dateSchema = z.iso.date();

export const dateTimeSchema = z.iso.datetime({ offset: true });

export const appointmentStatusSchema = z.enum([
  "PROGRAMADA",
  "COMPLETADA",
  "CANCELADA",
]);

export const userRoleSchema = z.enum([
  "RECEPCIONISTA",
  "MEDICO",
  "GERENCIA",
]);
