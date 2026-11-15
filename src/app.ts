
import cors from "cors";
import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.js";
import { authRouter } from "./routes/auth.routes.js";
import { patientRouter } from "./routes/patient.routes.js";
import {
  doctorRouter,
  specialtyRouter,
} from "./routes/doctor.routes.js";
import { appointmentRouter } from "./routes/appointment.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/specialties", specialtyRouter);
app.use("/api/reports", reportRouter);
app.use("/api/appointments", appointmentRouter);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(notFound);
app.use(errorHandler);
