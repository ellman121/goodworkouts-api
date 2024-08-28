import { jwtVerify } from "jose";
import { Attributes } from "sequelize";
import { createSecretKey } from "crypto";
import { Request, Response, NextFunction } from "express";

import { sendError } from "src/utils/responses";
import User from "src/database/models/user.model";

declare global {
  // I generally like this rule, but you have to disable it
  // when globally editing the Express.Request interface
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      user?: Attributes<User>;
    }
  }
}

const key = createSecretKey(Buffer.from("super_sercret"));
const TOKEN_EXPIRATION_TIME_MS = 3 * 60 * 60 * 1000; // 3 hours

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Unauthorized");
    }

    const token = await jwtVerify<Goodworkouts.JWTPayload>(
      authHeader.split(" ")[1],
      key
    );

    // If the token is too old, return 400
    if (Date.now() >= TOKEN_EXPIRATION_TIME_MS + (token.payload.iat ?? 0)) {
      return sendError(res, 400, "Token expired");
    }

    // Fetch the user from the database using the userId
    const user = await User.findOne({
      where: { id: token.payload.userId },
    });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Add the user to the request object
    req.user = user.toJSON();
    next();
  } catch (_) {
    console.log(_);
    return sendError(res, 500, "Internal server error");
  }
}
