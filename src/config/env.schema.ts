/**
 * Este archivo comprueba que las variables de configuración necesarias
 * para que la aplicación funcione estén correctamente definidas antes
 * de arrancar.
 *
 * Utiliza Zod para validar que las variables existan y tengan
 * el formato correcto.
 */

import { z } from "zod";

export const environmentSchema = z.object({
  // URL de conexión a la base de datos PostgreSQL.
  DATABASE_URL: z.string().url(),

  // Clave secreta utilizada para firmar y verificar los tokens JWT.
  // Es obligatoria y no debe estar vacía.
  JWT_SECRET: z.string().min(1, "JWT_SECRET es obligatoria"),

  // Entorno de ejecución: desarrollo, pruebas o producción.
  // Si no se especifica, se utiliza "development".
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Puerto en el que se ejecutará el servidor.
  // Se convierte a número y debe ser un entero positivo.
  // Si no se especifica, se utiliza el puerto 3000.
  PORT: z.coerce.number().int().positive().default(3000),
});
