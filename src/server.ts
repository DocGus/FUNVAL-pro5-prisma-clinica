import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const startServer = async (): Promise<void> => {
  // 1. Conectar con PostgreSQL antes de iniciar Express.
  await prisma.$connect();

  console.log("Database connected successfully");

  // 2. Iniciar el servidor HTTP.
  const server = app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });

  let isShuttingDown = false;

  // 3. Cerrar ordenadamente el servidor y Prisma.
  const shutdown = (signal: NodeJS.Signals): void => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    console.log(`${signal} received. Shutting down...`);

    server.close(async (error) => {
      if (error) {
        console.error("Error closing HTTP server:", error);
        process.exitCode = 1;
      }

      try {
        await prisma.$disconnect();
        console.log("Database connection closed");
      } catch (disconnectError) {
        console.error("Error disconnecting Prisma:", disconnectError);
        process.exitCode = 1;
      }
    });
  };

  // 4. Escuchar señales de cierre del sistema.
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
};

// 5. Gestionar errores durante el arranque.
void startServer().catch(async (error: unknown) => {
  console.error("Failed to start API:", error);

  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error("Error disconnecting Prisma:", disconnectError);
  }

  process.exitCode = 1;
});