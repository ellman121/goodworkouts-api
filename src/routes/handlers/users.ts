import { Request, Response } from "express";

import User from "src/database/models/user.model";
import { sendError, sendResponse } from "src/utils/responses";
import { validateRequestBody } from "src/utils/validation";
import { createUserBodySchema, updateUserBodySchema } from "./schemas";

export async function getLoggedInUserInfo(req: Request, res: Response) {
  const user = await User.findOne({
    where: { id: req.user.id },
    attributes: { exclude: ["password", "email"] },
  });

  if (!user) return sendError(res, 404, "User not found");

  return sendResponse(res, user.toJSON());
}

export async function createUser(req: Request, res: Response) {
  const v = await validateRequestBody(createUserBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const user = await User.create(v.body);

  if (!user) return sendError(res, 404, "User not found");

  return sendResponse(res, user.toJSON());
}

export async function updateUser(req: Request, res: Response) {
  const v = await validateRequestBody(updateUserBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const [user] = await User.upsert({
    ...v.body,
    id: req.user.id,
  });

  if (!user) return sendError(res, 404, "User not found");

  return sendResponse(res, user.toJSON());
}

export async function deleteUser(req: Request, res: Response) {
  const user = await User.findOne({
    where: { id: req.user.id },
  });

  if (!user) return sendError(res, 404, "User not found");

  await user.destroy();

  return sendResponse(res, { message: `User '${user.id}' deleted` });
}
