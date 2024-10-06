import { uniq } from "ramda";
import { Request, Response } from "express";

import Routine from "src/database/models/routine.model";
import { validateRequestBody } from "src/utils/validation";
import { sendError, sendResponse } from "src/utils/responses";

import { routineBodySchema } from "./schemas";
import Exercise from "src/database/models/exercise.model";
import { Op } from "sequelize";

export async function getRoutines(req: Request, res: Response) {
  const es = await Routine.findAll({
    where: { userId: req.user.id },
  });

  return sendResponse(
    res,
    es.map((e) => e.toJSON())
  );
}

export async function getRoutineById(
  req: Request<{ id: string }>,
  res: Response
) {
  const exercise = await Routine.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!exercise) return sendError(res, 404, "Exercise not found");

  return sendResponse(res, exercise.toJSON());
}

async function allExercisesAreValid(exercises: string[], userId: string) {
  const uniqueExerciseIds = uniq(exercises);
  const { count } = await Exercise.findAndCountAll({
    where: { userId, id: { [Op.in]: uniqueExerciseIds } },
  });

  return count === uniqueExerciseIds.length;
}

export async function createRoutine(req: Request, res: Response) {
  const v = await validateRequestBody(routineBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  if (
    !(await allExercisesAreValid(v.body.exercises as string[], req.user.id))
  ) {
    return sendError(
      res,
      400,
      "Exercises array contains invalid exercise UUIDs"
    );
  }

  const r = await Routine.create({
    name: v.body.name,
    userId: req.user.id,
    exercises: v.body.exercises as string[],
  });

  if (!r) return sendError(res, 404, "User not found");

  return sendResponse(res, r.toJSON());
}

export async function updateRoutine(req: Request, res: Response) {
  const v = await validateRequestBody(routineBodySchema, req.body);
  if (!v.body)
    return sendError(res, 400, "Invalid request body", v.errorMessages);

  if (
    !(await allExercisesAreValid(v.body.exercises as string[], req.user.id))
  ) {
    return sendError(
      res,
      400,
      "Exercises array contains invalid exercise UUIDs"
    );
  }

  const exercise = await Routine.findOne({
    where: { id: req.params.routineId, userId: req.user.id },
  });

  if (!exercise) return sendError(res, 404, "Exercise not found");

  await exercise.update({
    name: v.body.name,
    exercises: v.body.exercises as string[],
  });

  return sendResponse(res, exercise.toJSON());
}

export async function deleteRoutine(
  req: Request<{ routineId: string }>,
  res: Response
) {
  const r = await Routine.findOne({
    where: { id: req.params.routineId, userId: req.user.id },
  });

  if (!r) return sendError(res, 404, "Set not found");

  await r.destroy();

  return sendResponse(res);
}
