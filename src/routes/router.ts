import { Router } from "express";

import { userAuth } from "./middleware/injectUser";
import { validateUUIDs } from "./middleware/validateUUIDs";

import { createUser, getLoggedInUserInfo, updateUser } from "./handlers/users";
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
} from "./handlers/exercises";

const router = Router();

// I don't like the ugly code to make this eslint rule go away when
// passing handler functions to the router. Since this entire file
// is just router.method() calls, I just disable the rule here
/* eslint-disable @typescript-eslint/no-misused-promises */

router.get("/", (_, res) => {
  res.send("Hello, world!");
});

// User routes
router.get("/users", [userAuth], getLoggedInUserInfo);
router.post("/users", [], createUser); // No auth when creating a user
router.put("/users", [userAuth], updateUser);

// Exercise routes
const exercisesById = "/exercises/:exerciseId";
router.get("/exercises", [userAuth], getExercises);
router.post("/exercises", [userAuth], createExercise);
router.delete(`${exercisesById}`, [userAuth, validateUUIDs], deleteExercise);

// Exercise Set Routes
const setsById = "/sets/:setId";
router.get(`${exercisesById}/sets`, [userAuth, validateUUIDs], getExerciseSets);
router.post(
  `${exercisesById}/sets`,
  [userAuth, validateUUIDs],
  createExerciseSet
);
router.put(
  `${exercisesById}${setsById}`,
  [userAuth, validateUUIDs],
  updateExerciseSet
);
router.delete(
  `${exercisesById}${setsById}`,
  [userAuth, validateUUIDs],
  deleteExerciseSet
);

export default router;
