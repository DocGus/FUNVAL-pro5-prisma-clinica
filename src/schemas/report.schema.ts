import { z } from "zod";
import { dateSchema } from "./common.schema.js";

export const reportDateQuerySchema = z.object({
  date: dateSchema,
});

export type ReportDateQuery = z.infer<typeof reportDateQuerySchema>;
