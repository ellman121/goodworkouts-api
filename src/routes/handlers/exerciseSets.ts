import { QueryTypes } from "sequelize";
import { Request, Response } from "express";

import Exercise from "src/database/models/exercise.model";
import ExerciseSet from "src/database/models/exerciseSet.model";
import { sendError, sendResponse } from "src/utils/responses";
import { validateRequestBody } from "src/utils/validation";

import { setBodySchema } from "./schemas";

export async function getExerciseSets(
  req: Request<{ exerciseId: string }>,
  res: Response,
) {
  const e = await Exercise.findOne({
    attributes: ["id", "name"],
    where: { id: req.params.exerciseId, userId: req.user.id },
  });

  if (!e) return sendError(res, 404, "Exercise not found");

  const sets = await ExerciseSet.findAll({
    attributes: ["id", "reps", "createdAt"],
    where: { exerciseId: e.id },
    order: [["updatedAt", "DESC"]],
  });

  return sendResponse(res, {
    exercise: e.toJSON(),
    sets: sets.map((s) => s.toJSON()),
  });
}

export async function createExerciseSet(
  req: Request<{ exerciseId: string }>,
  res: Response,
) {
  const v = validateRequestBody(setBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const exercise = await Exercise.findOne({
    where: { id: req.params.exerciseId, userId: req.user.id },
  });

  if (!exercise) return sendError(res, 404, "Exercise not found");

  const set = await ExerciseSet.create({
    exerciseId: exercise.id,
    reps: v.body.reps as [number, number][],
  });

  return sendResponse(res, set.toJSON());
}

export async function updateExerciseSet(
  req: Request<{ exerciseId: string; setId: string }>,
  res: Response,
) {
  const v = validateRequestBody(setBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  const exercise = await Exercise.findOne({
    where: { id: req.params.exerciseId, userId: req.user.id },
  });

  if (!exercise) return sendError(res, 404, "Exercise not found");

  const set = await ExerciseSet.findOne({
    where: { id: req.params.setId, exerciseId: req.params.exerciseId },
  });

  if (!set) return sendError(res, 404, "Set not found");

  await set.update({
    reps: v.body.reps as Array<[number, number]>,
  });

  return sendResponse(res, set.toJSON());
}

export async function deleteExerciseSet(
  req: Request<{ exerciseId: string; setId: string }>,
  res: Response,
) {
  const deleted = await ExerciseSet.sequelize!.query<{ id: string }>(
    `DELETE FROM sets
     WHERE id = :setId
       AND "exerciseId" = :exerciseId
       AND EXISTS (
         SELECT 1 FROM exercises
         WHERE id = :exerciseId AND "userId" = :userId
       )
     RETURNING id`,
    {
      replacements: {
        setId: req.params.setId,
        exerciseId: req.params.exerciseId,
        userId: req.user.id,
      },
      type: QueryTypes.SELECT,
    },
  );

  if (deleted.length === 0) return sendError(res, 404, "Set not found");

  return sendResponse(res);
}
