import { Request, Response, NextFunction } from "express";
import { Attributes } from "sequelize";
import { User } from "src/database/models/user.model";
import { sendError } from "src/utils/responses";

declare global {
  // I generally like this rule, but you have to disable it
  // when globally editing the Express.Request interface
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    /**
     * Represents the request object for the middleware function `injectUser`.
     */
    export interface Request {
      /*
       * If not undefined, the user is logged in and this object
       * contains some basic user information
       */
      user?: Attributes<User>;
    }
  }
}

export async function injectUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.header("x-user-id");

  try {
    // Fetch the user from the database using the userId
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Add the user to the request object
    req.user = user.toJSON();
    next();
  } catch (_) {
    return sendError(res, 500, "Internal server error");
  }
}
