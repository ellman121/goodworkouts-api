import Ajv from "ajv";
import { JTDDataType } from "ajv/dist/core";
import { User } from "src/database/models/user.model";
import { Request, Response } from "express";
import { sendError, sendResponse } from "src/utils/responses";
import { validate } from 'uuid';

const ajv = new Ajv();

interface GetUserByIdParams {
  id: string;
}

export async function getUserById(
  req: Request<GetUserByIdParams>,
  res: Response
) {
  if (!validate(req.params.id)) {
    return sendError(res, 400, "Invalid user ID");
  }

  const user = await User.findOne({ where: { id: req.params.id } });

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  return sendResponse(res, user.toJSON());
}

type CreateUserRequestBody = JTDDataType<typeof createUserRequestBodySchema>;
const createUserRequestBodySchema = {
  type: "object",
  properties: {
    username: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
  },
  required: ["username", "email", "password"],
  additionalProperties: false,
} as const;

export async function createUser(
  req: Request<null, null, CreateUserRequestBody>,
  res: Response
) {
  const v = ajv.validate(createUserRequestBodySchema, req.body);
  if (!v) {
    console.log(ajv.errors);
    return sendError(res, 400, ajv.errorsText());
  }

  const user = await User.create(req.body);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  return sendResponse(res, user.toJSON());
}
