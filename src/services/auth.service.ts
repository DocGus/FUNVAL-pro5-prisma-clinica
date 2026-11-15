import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";
import {
  createDoctorUser,
  createUser,
  findUserByEmail,
} from "../models/user.model.js";
import type {
  LoginInput,
  RegisterInput,
} from "../schemas/user.schema.js";
import { AppError } from "../utils/app-error.js";

export const register = async (data: RegisterInput) => {
  const email = data.email.trim().toLowerCase();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError(
      409,
      "CONFLICT",
      "Ya existe una cuenta con ese correo electrónico.",
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    if (data.role === "MEDICO") {
      const result = await createDoctorUser(
        { ...data, email },
        passwordHash,
      );

      if (result.status === "DOCTOR_NOT_FOUND") {
        throw new AppError(
          404,
          "NOT_FOUND",
          "No existe un médico con el identificador proporcionado.",
        );
      }

      if (result.status === "DOCTOR_ALREADY_LINKED") {
        throw new AppError(
          409,
          "CONFLICT",
          "El médico ya tiene una cuenta vinculada.",
        );
      }

      return result.user;
    }

    return await createUser(
      { ...data, email },
      passwordHash,
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        409,
        "CONFLICT",
        "El correo electrónico o el médico ya están vinculados a otra cuenta.",
      );
    }

    throw error;
  }
};

export const login = async (data: LoginInput) => {
  const email = data.email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError(
      401,
      "AUTHENTICATION_ERROR",
      "Correo electrónico o contraseña incorrectos.",
    );
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError(
      401,
      "AUTHENTICATION_ERROR",
      "Correo electrónico o contraseña incorrectos.",
    );
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { token };
};
