import { Attributes } from "sequelize";
import { Request, Response, NextFunction } from "express";

import { sendError } from "src/utils/responses";
import User from "src/database/models/user.model";
import { validateJWT } from "src/utils/jtw";

declare global {
  // I generally like this rule, but you have to disable it
  // when globally editing the Express.Request interface
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      user: Attributes<User>;
    }
  }
}

export async function userAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.header("Authorization");

    // No credentials is an authentication failure, not a server error — every
    // path out of this middleware either sets req.user or responds.
    if (!authHeader?.startsWith("Bearer "))
      return sendError(res, 401, "Unauthorized");

    // Only access tokens authenticate a request; a refresh token presented here
    // is rejected by validateJWT.
    const jwt = await validateJWT(authHeader.split(" ")[1], "access");

    if (!jwt.valid || !jwt.payload) return sendError(res, 401, "Unauthorized");

    // Fetch the user from the database using the userId.
    // The password hash is excluded so it never enters request state.
    const user = await User.findOne({
      where: { id: jwt.payload.userId },
      attributes: { exclude: ["password"] },
    });

    if (!user) return sendError(res, 404, "User not found");

    // Add the user to the request object
    req.user = user.toJSON();

    next();
  } catch (_) {
    console.error(_);
    return sendError(res, 500, "Internal server error");
  }
}
