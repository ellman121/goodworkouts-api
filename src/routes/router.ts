import { Router } from "express";
import { createUser, getUserById } from "./handlers/users";

const router = Router();

/*
 * User Routes
 */
router.get("/users/:id", getUserById);
router.post("/users", createUser);

export default router;
