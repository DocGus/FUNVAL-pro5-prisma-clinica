import type { RequestHandler } from "express";
import { login, register } from "../services/auth.service.js";

export const loginController: RequestHandler = async (
  request,
  response,
) => {
  const result = await login(request.body);
  response.status(200).json(result);
};

export const registerController: RequestHandler = async (
  request,
  response,
) => {
  const user = await register(request.body);
  response.status(201).json(user);
};
