import { Request, Response } from "express";
import { User } from "src/models";
import { sendError, sendResponse } from "src/utils/responses";

export async function getUserById(req: Request, res: Response) {
  const user = await User.findOne({ where: { id: req.params.id } });

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  return sendResponse(res, user.toJSON());
}

interface CreateUserRequestBody {
  username: string;
  email: string;
  password: string;
}

export async function createUser(
  req: Request<null, null, CreateUserRequestBody>,
  res: Response
) {
  if (!req.body.username || !req.body.email || !req.body.password)
    return sendError(res, 400, "Missing required user creation data");

  const user = await User.create(req.body);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  return sendResponse(res, user.toJSON());
}
