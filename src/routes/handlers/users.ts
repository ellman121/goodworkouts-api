import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { UniqueConstraintError } from "sequelize";

import User from "src/database/models/user.model";
import Exercise from "src/database/models/exercise.model";
import { withTransaction } from "src/database";
import { sendError, sendResponse } from "src/utils/responses";
import { validateRequestBody } from "src/utils/validation";
import { createUserBodySchema, updateUserBodySchema } from "./schemas";

// Signup is invite-only while the app is in alpha
const inviteCode = process.env.INVITE_CODE;
if (!inviteCode) throw new Error("INVITE_CODE env var is not set");

const DEFAULT_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-Up",
  "Lat Pulldown",
  "Dumbbell Curl",
  "Tricep Pushdown",
  "Leg Press",
];

// Constant-time invite-code check. Length is guarded first (timingSafeEqual
// throws on unequal-length buffers), then bytes are compared without early-out.
const expectedInviteCode = new TextEncoder().encode(inviteCode);
const inviteCodeMatches = (provided: string) => {
  const a = new TextEncoder().encode(provided);
  return (
    a.length === expectedInviteCode.length &&
    timingSafeEqual(a, expectedInviteCode)
  );
};

export async function getLoggedInUserInfo(req: Request, res: Response) {
  const user = await User.findOne({
    where: { id: req.user.id },
    attributes: { exclude: ["password"] },
  });

  if (!user) return sendError(res, 404, "User not found");

  return sendResponse(res, user.toJSON());
}

export async function createUser(req: Request, res: Response) {
  const v = validateRequestBody(createUserBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const { inviteCode: providedInviteCode, ...userFields } = v.body;
  if (!inviteCodeMatches(providedInviteCode))
    return sendError(res, 403, "Invalid invite code");

  const hashedPassword = await bcrypt.hash(userFields.password, 10);

  try {
    const newUser = await withTransaction(async (transaction) => {
      const newUser = await User.create(
        { ...userFields, password: hashedPassword },
        { transaction },
      );

      await Exercise.bulkCreate(
        DEFAULT_EXERCISES.map((name) => ({ name, userId: newUser.id })),
        { transaction },
      );

      return newUser;
    });

    const { password: _, ...safeUser } = newUser.toJSON();
    return sendResponse(res, safeUser);
  } catch (error) {
    if (error instanceof UniqueConstraintError)
      return sendError(res, 409, "Username already in use");
    throw error;
  }
}

export async function updateUser(req: Request, res: Response) {
  const v = validateRequestBody(updateUserBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const updates = { ...v.body };
  if (updates.password)
    updates.password = await bcrypt.hash(updates.password, 10);

  let user: User | null;
  try {
    [user] = await User.upsert({
      ...updates,
      id: req.user.id,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError)
      return sendError(res, 409, "Username already in use");
    throw error;
  }

  if (!user) return sendError(res, 404, "User not found");

  const { password: _, ...safeUser } = user.toJSON();
  return sendResponse(res, safeUser);
}

export async function deleteUser(req: Request, res: Response) {
  const user = await User.findOne({
    where: { id: req.user.id },
  });

  if (!user) return sendError(res, 404, "User not found");

  await user.destroy();

  return sendResponse(res, { message: `User '${user.id}' deleted` });
}
