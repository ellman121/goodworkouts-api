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
  next: NextFunction
) {
  try {
    if (req.header("Authorization")) {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer "))
        return sendError(res, 401, "Unauthorized");

      const jwt = await validateJWT(authHeader.split(" ")[1]);
      
      if (!jwt.valid || !jwt.payload)
        return sendError(res, 401, "Unauthorized");

      // Fetch the user from the database using the userId
      const user = await User.findOne({
        where: { id: jwt.payload.userId },
      });

      if (!user) return sendError(res, 404, "User not found");

      // Add the user to the request object
      req.user = user.toJSON();
    } else if (req.app.get("env") === "development") {
      console.log("Injecting dev user");
      const devUser = await User.findOne({
        where: { id: "6c677a30-e584-43df-a552-b47a7a95a0b4" },
      });

      if (!devUser) return sendError(res, 404, "User not found");
      req.user = devUser.toJSON();
    }

    next();
  } catch (_) {
    console.error(_);
    return sendError(res, 500, "Internal server error");
  }
}
