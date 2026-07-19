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

      // Fetch the user from the database using the userId.
      // The password hash is excluded so it never enters request state.
      const user = await User.findOne({
        where: { id: jwt.payload.userId },
        attributes: { exclude: ["password"] },
      });

      if (!user) return sendError(res, 404, "User not found");

      // Add the user to the request object
      req.user = user.toJSON();
    } else if (
      // Auto-login is an explicit, off-by-default opt-in. It must never be
      // NODE_ENV-derived: a deploy that forgets NODE_ENV must not authenticate.
      process.env.ENABLE_DEV_AUTOLOGIN === "true" &&
      process.env.NODE_ENV !== "production"
    ) {
      console.log("Injecting dev user");
      const devUser = await User.findOne({
        where: {
          id:
            process.env.DEV_AUTOLOGIN_USER_ID ??
            "6c677a30-e584-43df-a552-b47a7a95a0b4",
        },
        attributes: { exclude: ["password"] },
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
