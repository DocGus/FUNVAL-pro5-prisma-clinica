import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../src/config/prisma.js";

const emailSchema = z.email();
const passwordSchema = z.string().min(8);

const askEmail = async (): Promise<string> => {
  const terminal = createInterface({ input: stdin, output: stdout });

  try {
    return await terminal.question("Correo de GERENCIA: ");
  } finally {
    terminal.close();
  }
};

const askHiddenPassword = async (): Promise<string> => {
  if (!stdin.isTTY) {
    throw new Error("La contraseña debe introducirse desde una terminal interactiva.");
  }

  stdout.write("Contraseña de GERENCIA (mínimo 8 caracteres): ");

  stdin.setEncoding("utf8");
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let password = "";

    const finish = (error?: Error): void => {
      stdin.removeListener("data", handleInput);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");

      if (error) {
        reject(error);
      } else {
        resolve(password);
      }
    };

    const handleInput = (data: string): void => {
      for (const character of data) {
        if (character === "\u0003") {
          finish(new Error("Operación cancelada."));
          return;
        }

        if (character === "\r" || character === "\n") {
          finish();
          return;
        }

        if (character === "\u007f" || character === "\b") {
          password = password.slice(0, -1);
          continue;
        }

        if (character >= " ") {
          password += character;
        }
      }
    };

    stdin.on("data", handleInput);
  });
};

const createInitialManager = async (): Promise<void> => {
  try {
    // Evita crear una segunda cuenta GERENCIA.
    const existingManager = await prisma.user.findFirst({
      where: { role: "GERENCIA" },
      select: { id: true },
    });

    if (existingManager) {
      console.log("Ya existe una cuenta GERENCIA. No se realizaron cambios.");
      return;
    }

    // Solicitar y normalizar el correo.
    const email = (await askEmail()).trim().toLowerCase();

    const validEmail = emailSchema.safeParse(email);

    if (!validEmail.success) {
      throw new Error("El correo electrónico no tiene un formato válido.");
    }

    // Solicitar contraseña sin mostrarla en pantalla.
    const password = await askHiddenPassword();

    const validPassword = passwordSchema.safeParse(password);

    if (!validPassword.success) {
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }

    // Comprobar que el correo no esté ocupado.
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new Error("Ya existe una cuenta con ese correo electrónico.");
    }

    // Generar hash con factor de costo 10.
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear la cuenta inicial de GERENCIA.
    const manager = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "GERENCIA",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log("\nCuenta GERENCIA creada correctamente.");
    console.log({
      id: manager.id,
      email: manager.email,
      role: manager.role,
    });
  } finally {
    await prisma.$disconnect();
  }
};

void createInitialManager().catch((error: unknown) => {
  console.error(
    "No fue posible crear la cuenta GERENCIA:",
    error instanceof Error ? error.message : "Error inesperado",
  );
  process.exitCode = 1;
});
