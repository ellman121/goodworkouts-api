import { Router } from "express";

import { userAuth } from "./middleware/injectUser";
import { validateIdParams } from "./middleware/validateUUIDs";

import { login, reauthenticate } from "./handlers/authentication";
import {
  createUser,
  deleteUser,
  getLoggedInUserInfo,
  updateUser,
} from "./handlers/users";
import {
  createExerciseSet,
  deleteExerciseSet,
  getExerciseSets,
  updateExerciseSet,
} from "./handlers/exerciseSets";
import {
  createExercise,
  getExercises,
  deleteExercise,
  updateExercise,
} from "./handlers/exercises";
import {
  createRoutine,
  deleteRoutine,
  getRoutineById,
  getRoutines,
  updateRoutine,
} from "./handlers/routines";

const router = Router();

// I don't like the ugly code to make this eslint rule go away when
// passing handler functions to the router. Since this entire file
// is just router.method() calls, I just disable the rule here
/* eslint-disable @typescript-eslint/no-misused-promises */

router.get("/", (_, res) => {
  res.send("Hello, world!");
});

// Authentication
router.post("/login", [], login);
router.post("/reauthenticate", [], reauthenticate);

// User
router.get("/users", [userAuth], getLoggedInUserInfo);
router.post("/users", [], createUser);
router.put("/users", [userAuth], updateUser);
router.delete("/users", [userAuth], deleteUser);

// Exercise
const exercisesById = "/exercises/:exerciseId";
router.get("/exercises", [userAuth], getExercises);
router.post("/exercises", [userAuth], createExercise);
router.get(`${exercisesById}`, [userAuth, validateIdParams], getExercises);
router.put(`${exercisesById}`, [userAuth, validateIdParams], updateExercise);
router.delete(`${exercisesById}`, [userAuth, validateIdParams], deleteExercise);

// Exercise Set
const setsById = "/sets/:setId";
router.get(`${exercisesById}/sets`, [userAuth, validateIdParams], getExerciseSets);
router.post(`${exercisesById}/sets`, [userAuth, validateIdParams], createExerciseSet);
router.put(`${exercisesById}${setsById}`, [userAuth, validateIdParams], updateExerciseSet );
router.delete(`${exercisesById}${setsById}`, [userAuth, validateIdParams], deleteExerciseSet);

// Routines
const routinesById = "/routines/:routineId";
router.get("/routines", [userAuth], getRoutines);
router.post("/routines", [userAuth], createRoutine);
router.get(`${routinesById}`, [userAuth, validateIdParams], getRoutineById);
router.put(`${routinesById}`, [userAuth, validateIdParams], updateRoutine);
router.delete(`${routinesById}`, [userAuth, validateIdParams], deleteRoutine);

export default router;
