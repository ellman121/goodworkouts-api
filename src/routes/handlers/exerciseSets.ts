import { Request, Response } from "express";

import Exercise from "src/database/models/exercise.model";
import ExerciseSet from "src/database/models/exerciseSet.model";
import { sendError, sendResponse } from "src/utils/responses";
import { validateRequestBody } from "src/utils/validation";

import { setBodySchema } from "./schemas";

export async function getExerciseSets(
  req: Request<{ exerciseId: string }>,
  res: Response
) {
  const e = await Exercise.findOne({
    attributes: ["id", "name"],
    where: { id: req.params.exerciseId },
  });

  if (!e) return sendError(res, 404, "Exercise not found");

  const sets = await ExerciseSet.findAll({
    attributes: ["reps", "createdAt"],
    where: { exerciseId: e.id },
    order: [["createdAt", "DESC"]],
  });

  return sendResponse(res, {
    exercise: e.toJSON(),
    sets: sets.map((s) => s.toJSON()),
  });
}

export async function createExerciseSet(
  req: Request<{ exerciseId: string }>,
  res: Response
) {
  const v = await validateRequestBody(setBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const exercise = await Exercise.findOne({
    where: { id: req.params.exerciseId },
  });

  if (!exercise) return sendError(res, 404, "Exercise not found");

  const set = await ExerciseSet.create({
    exerciseId: exercise.id,
    reps: v.body.reps as [number, number][],
  });

  return sendResponse(res, set.toJSON());
}

export async function updateExerciseSet(
  req: Request<{ exerciseId: string }>,
  res: Response
) {
  const v = await validateRequestBody(setBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const exercise = await Exercise.findOne({
    where: { id: req.params.exerciseId },
  });

  if (!exercise) return sendError(res, 404, "Exercise not found");

  const set = await ExerciseSet.create({
    exerciseId: exercise.id,
    reps: v.body.reps as [number, number][],
  });

  return sendResponse(res, set.toJSON());
}

export async function deleteExerciseSet(
  req: Request<{ exerciseId: string; setId: string }>,
  res: Response
) {
  const s = await ExerciseSet.findOne({
    where: { id: req.params.setId, exerciseId: req.params.exerciseId },
  });

  if (!s) return sendError(res, 404, "Set not found");

  await s.destroy();

  return sendResponse(res);
}
