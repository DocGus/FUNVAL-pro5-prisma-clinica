// ============================================================
// 1. IMPORTACIONES
// ============================================================

// Dependencias externas.
import cors from "cors";
import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";

// Documentación OpenAPI de las 13 operaciones funcionales.
import { openApiDocument } from "./docs/openapi.js";

// Middlewares propios para manejar errores y rutas inexistentes.
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";

// ============================================================
// 2. CREACIÓN DE LA APLICACIÓN
// ============================================================

export const app: Express = express();

// ============================================================
// 3. MIDDLEWARES GLOBALES
// ============================================================

// Permite solicitudes desde otros orígenes.
app.use(cors());

// Permite recibir y procesar cuerpos JSON.
app.use(express.json());

// ============================================================
// 4. ENDPOINT DE SALUD
// ============================================================

// Comprueba que la API está respondiendo.
app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

// ============================================================
// 5. DOCUMENTACIÓN SWAGGER / OPENAPI
// ============================================================

// Publica la documentación interactiva de la API.
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument),
);

// ============================================================
// 6. MANEJO DE RUTAS Y ERRORES
// ============================================================

// Debe ir después de las rutas existentes.
// Responde cuando una ruta no está implementada.
app.use(notFound);

// Debe ser el último middleware.
// Centraliza los errores de la aplicación.
app.use(errorHandler);