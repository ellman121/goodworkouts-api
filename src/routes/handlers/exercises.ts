import { validate } from "uuid";
import { Request, Response } from "express";

import { sendError, sendResponse } from "src/utils/responses";
import { validateRequestBody } from "src/utils/validation";
import Exercise from "src/database/models/exercise.model";

export async function getExercises(req: Request, res: Response) {
  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  const exercises = await Exercise.findAll({
    where: { userId: req.user.id },
  });

  return sendResponse(
    res,
    exercises.map((e) => e.toJSON())
  );
}

export async function getExerciseById(
  req: Request<{ id: string }>,
  res: Response
) {
  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  if (!validate(req.params.id)) {
    return sendError(res, 400, "Invalid user ID");
  }

  const exercise = await Exercise.findOne({
    where: { id: req.params.id },
  });

  if (!exercise) {
    return sendError(res, 404, "Exercise not found");
  }

  return sendResponse(res, exercise.toJSON());
}

const createExerciseRequestBodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
  required: ["name"],
  additionalProperties: false,
} as const;

export async function createExercise(req: Request, res: Response) {
  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  const v = await validateRequestBody(
    createExerciseRequestBodySchema,
    req.body
  );
  if (!v.body) {
    return sendError(
      res,
      400,
      "Invalid request body",
      v.errors.map((e) => e.message)
    );
  }

  const user = await Exercise.create({
    name: v.body.name,
    userId: req.user.id,
  });

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  return sendResponse(res, user.toJSON());
}
