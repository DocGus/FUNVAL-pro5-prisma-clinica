import cors from "cors";
import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.js";
import { authRouter } from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(notFound);
app.use(errorHandler);
