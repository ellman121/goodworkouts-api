import * as R from "ramda";
import { Request, Response, NextFunction } from "express";
import { validate } from "uuid";
import { sendError } from "src/utils/responses";

const isIdParam = R.endsWith("Id");
const isUUID = (value: string) => validate(value);

export function validateUUIDs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  for (const [param, value] of Object.entries(req.params)) {
    if (isIdParam(param) && !isUUID(value)) {
      return sendError(
        res,
        400,
        `Invalid request: '${value}' is not a valid UUID`
      );
    }
  }

  next();
}
