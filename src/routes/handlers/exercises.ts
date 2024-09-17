import { Request, Response } from "express";

import Exercise from "src/database/models/exercise.model";
import ExerciseSet from "src/database/models/exerciseSet.model";
import { validateRequestBody } from "src/utils/validation";
import { sendError, sendResponse } from "src/utils/responses";

import { exerciseBodySchema } from "./schemas";

export async function getExercises(req: Request, res: Response) {
  const es = await Exercise.findAll({
    where: { userId: req.user.id },
  });

  return sendResponse(
    res,
    es.map((e) => e.toJSON())
  );
}

export async function getExerciseById(
  req: Request<{ id: string }>,
  res: Response
) {
  const exercise = await Exercise.findOne({
    where: { id: req.params.id },
  });

  if (!exercise) return sendError(res, 404, "Exercise not found");

  return sendResponse(res, exercise.toJSON());
}

export async function createExercise(req: Request, res: Response) {
  const v = await validateRequestBody(exerciseBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const e = await Exercise.create({
    name: v.body.name,
    userId: req.user.id,
  });

  if (!e) return sendError(res, 404, "User not found");

  return sendResponse(res, e.toJSON());
}

export async function updateExercise(req: Request, res: Response) {
  const v = await validateRequestBody(exerciseBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const exercise = await Exercise.create({
    name: v.body.name,
    userId: req.user.id,
  });

  if (!exercise) return sendError(res, 404, "User not found");

  return sendResponse(res, exercise.toJSON());
}

export async function deleteExercise(
  req: Request<{ exerciseId: string }>,
  res: Response
) {
  const e = await Exercise.findOne({
    where: { id: req.params.exerciseId },
  });

  if (!e) return sendError(res, 404, "Set not found");

  // Delete associated sets and the exercise itself
  await Promise.all([
    await ExerciseSet.destroy({ where: { exerciseId: req.params.exerciseId } }),
    await e.destroy(),
    // TODO: Delete routines that contain this exercise
  ]);

  return sendResponse(res);
}
