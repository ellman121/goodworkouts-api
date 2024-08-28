import Ajv from "ajv";
import { validate } from "uuid";
import { JTDDataType } from "ajv/dist/core";
import { Request, Response } from "express";

import { sendError, sendResponse } from "src/utils/responses";
import { Exercise } from "src/database/models/exercise.model";

const ajv = new Ajv();

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

interface GetExerciseByIdParams {
  id: string;
}

export async function getExerciseById(
  req: Request<GetExerciseByIdParams>,
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

const createExerciseRequestBody = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
  required: ["name"],
  additionalProperties: false,
} as const;

export async function createExercise(
  req: Request<null, null, JTDDataType<typeof createExerciseRequestBody>>,
  res: Response
) {
  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  const v = ajv.validate(createExerciseRequestBody, req.body);
  if (!v) {
    console.log(ajv.errors);
    return sendError(res, 400, ajv.errorsText());
  }

  const user = await Exercise.create({ ...req.body, userId: req.user.id });

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  return sendResponse(res, user.toJSON());
}
