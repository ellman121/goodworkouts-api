import { Router } from "express";
import { getUserById } from "./handlers/users";

const router = Router();

/*
 * User Routes
 */
router.get("/users/:id", getUserById);

export default router;
