import { Request, Response } from "express";

import User from "src/database/models/user.model";
import { sendError, sendResponse } from "src/utils/responses";
import { validateRequestBody } from "src/utils/validation";
import { generateJWT, validateJWT } from "src/utils/jtw";

import { loginBodySchema, reauthenticateBodySchema } from "./schemas";

export async function login(req: Request, res: Response) {
  const v = await validateRequestBody(loginBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const user = await User.findOne({
    where: { username: v.body.username, password: v.body.password },
  });

  if (!user) return sendError(res, 404, "User not found");

  const token = await generateJWT({ userId: user.id }, "10800s");
  const refreshToken = await generateJWT({ userId: user.id }, "604800s");

  return sendResponse(res, { token, refreshToken });
}

export async function reauthenticate(req: Request, res: Response) {
  const v = await validateRequestBody(reauthenticateBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const tokenValid = await validateJWT(v.body.refreshToken);

  const user = await User.findOne({
    where: { id: tokenValid.payload?.userId },
  });
  if (!user) return sendError(res, 404, "User not found");

  const token = await generateJWT({ userId: user.id }, "10800s");
  const refreshToken = await generateJWT({ userId: user.id }, "604800s");

  return sendResponse(res, { token, refreshToken });
}
