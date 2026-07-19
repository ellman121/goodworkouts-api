import { Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";

import { sendError } from "src/utils/responses";
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
  getExerciseById,
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

// Strict limiter for credential-checking routes to blunt brute-force /
// credential-stuffing. Keyed per-IP by default; behind a proxy the deployment
// must set app.set("trust proxy", <hop count>) for req.ip to be accurate.
const authLimiter = rateLimit({
  max: 10, // 10 attempts
  windowMs: 15 * 60 * 1000, // per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

// Express 4 does not catch rejected promises from async handlers — an
// uncaught throw would take down the whole process. Every handler goes
// through this guard so unexpected errors become 500 responses instead.
const safe =
  <Req extends Request>(handler: (req: Req, res: Response) => Promise<unknown>) =>
  async (req: Req, res: Response) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error(`Unhandled error in ${req.method} ${req.path}:`, error);
      if (!res.headersSent) sendError(res, 500);
    }
  };

// I don't like the ugly code to make this eslint rule go away when
// passing handler functions to the router. Since this entire file
// is just router.method() calls, I just disable the rule here
/* eslint-disable @typescript-eslint/no-misused-promises */

router.get("/", (_, res) => {
  res.send("Hello, world!");
});

// Authentication
router.post("/login", [authLimiter], safe(login));
router.post("/reauthenticate", [authLimiter], safe(reauthenticate));

// User
router.get("/users", [userAuth], safe(getLoggedInUserInfo));
router.post("/users", [], safe(createUser));
router.put("/users", [userAuth], safe(updateUser));
router.delete("/users", [userAuth], safe(deleteUser));

// Exercise
const exercisesById = "/exercises/:exerciseId";
router.get("/exercises", [userAuth], safe(getExercises));
router.post("/exercises", [userAuth], safe(createExercise));
router.get(`${exercisesById}`, [userAuth, validateIdParams], safe(getExerciseById));
router.put(`${exercisesById}`, [userAuth, validateIdParams], safe(updateExercise));
router.delete(`${exercisesById}`, [userAuth, validateIdParams], safe(deleteExercise));

// Exercise Set
const setsById = "/sets/:setId";
router.get(`${exercisesById}/sets`, [userAuth, validateIdParams], safe(getExerciseSets));
router.post(`${exercisesById}/sets`, [userAuth, validateIdParams], safe(createExerciseSet));
router.put(`${exercisesById}${setsById}`, [userAuth, validateIdParams], safe(updateExerciseSet) );
router.delete(`${exercisesById}${setsById}`, [userAuth, validateIdParams], safe(deleteExerciseSet));

// Routines
const routinesById = "/routines/:routineId";
router.get("/routines", [userAuth], safe(getRoutines));
router.post("/routines", [userAuth], safe(createRoutine));
router.get(`${routinesById}`, [userAuth, validateIdParams], safe(getRoutineById));
router.put(`${routinesById}`, [userAuth, validateIdParams], safe(updateRoutine));
router.delete(`${routinesById}`, [userAuth, validateIdParams], safe(deleteRoutine));

export default router;
