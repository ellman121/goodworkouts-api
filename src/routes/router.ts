import { Router } from "express";

import { authenticateUser } from "./middleware/injectUser";

import { getExercises } from "./handlers/exercises";
import { createUser, getUserById } from "./handlers/users";

const router = Router();

// I don't like the ugly code to make this eslint rule go away when
// passing handler functions to the router. Since this entire file
// is just router.method() calls, I just disable the rule here
/* eslint-disable @typescript-eslint/no-misused-promises */

// User routes
router.get("/users/:id", getUserById);
router.post("/users", createUser);

// Exercise routes
router.get("/exercises", [authenticateUser], getExercises);

export default router;
