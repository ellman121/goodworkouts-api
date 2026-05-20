import { uniq } from "ramda";
import { Request, Response } from "express";

import Routine from "src/database/models/routine.model";
import { validateRequestBody } from "src/utils/validation";
import { sendError, sendResponse } from "src/utils/responses";

import { routineBodySchema } from "./schemas";
import Exercise from "src/database/models/exercise.model";
import { Op } from "sequelize";

export async function getRoutines(req: Request, res: Response) {
  const routines = await Routine.findAll({
    where: { userId: req.user.id },
  });

  return sendResponse(
    res,
    routines.map((r) => r.toJSON())
  );
}

export async function getRoutineById(
  req: Request<{ routineId: string }>,
  res: Response
) {
  const routine = await Routine.findOne({
    where: { id: req.params.routineId, userId: req.user.id },
  });

  if (!routine) return sendError(res, 404, "Routine not found");

  return sendResponse(res, routine.toJSON());
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

  return sendResponse(res, r.toJSON());
}

export async function updateRoutine(
  req: Request<{ routineId: string }>,
  res: Response
) {
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

  const routine = await Routine.findOne({
    where: { id: req.params.routineId, userId: req.user.id },
  });

  if (!routine) return sendError(res, 404, "Routine not found");

  await routine.update({
    name: v.body.name,
    exercises: v.body.exercises as string[],
  });

  return sendResponse(res, routine.toJSON());
}

export async function deleteRoutine(
  req: Request<{ routineId: string }>,
  res: Response
) {
  const routine = await Routine.findOne({
    where: { id: req.params.routineId, userId: req.user.id },
  });

  if (!routine) return sendError(res, 404, "Routine not found");

  await routine.destroy();

  return sendResponse(res);
}
