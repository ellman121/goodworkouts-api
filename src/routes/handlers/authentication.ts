import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "src/database/models/user.model";
import { sendError, sendResponse } from "src/utils/responses";
import { validateRequestBody } from "src/utils/validation";
import { generateTokenPair, validateJWT } from "src/utils/jtw";

import { loginBodySchema, reauthenticateBodySchema } from "./schemas";

// A fixed valid bcrypt hash compared against when the user is absent, so login
// timing does not reveal whether a username exists.
const DUMMY_HASH =
  "$2b$10$ms1r2T1Ply37nPAqNEnGxOoegxCVveZnKZM2rrHIzk/xzP/.VuyX.";

export async function login(req: Request, res: Response) {
  const v = validateRequestBody(loginBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const user = await User.findOne({
    where: { username: v.body.username },
  });

  const passwordMatches = await bcrypt.compare(
    v.body.password,
    user?.password ?? DUMMY_HASH,
  );

  if (!user || !passwordMatches)
    return sendError(res, 401, "Invalid credentials");

  return sendResponse(res, await generateTokenPair(user.id));
}

export async function reauthenticate(req: Request, res: Response) {
  const v = validateRequestBody(reauthenticateBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const tokenValid = await validateJWT(v.body.refreshToken, "refresh");

  if (!tokenValid.valid) return sendError(res, 401);

  const user = await User.findOne({
    where: { id: tokenValid.payload?.userId },
  });
  if (!user) return sendError(res, 404, "User not found");

  return sendResponse(res, await generateTokenPair(user.id));
}
