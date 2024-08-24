import { Response } from "express";

export function sendResponse<T>(res: Response, data?: T, code: number = 200) {
  res.status(code)
  if (!data) {
    return res.json({
      status: "success",
    });
  }
  return res.json({
    status: "success",
    data,
  });
}

const defaultErrorMessages = {
  400: "Bad Request", // Bad request. Client has sent something weird
  401: "Unauthorized", // Unauthenticated request. Client didn't send an auth token
  403: "Forbidden", // Forbidden. Client is authenticated, but trying to access something they shouldn't
  404: "Not Found", // Resource not found / doesn't exist
  429: "Rate limit exceeded", // Client is making too many requests, too quickly
  500: "Internal Server Error", // Something's gone wrong on the backend
};

export function sendError<T>(res: Response, code: keyof typeof defaultErrorMessages, message?: string, data?: T) {
  return res.status(code).json({
    status: "error",
    message: message || defaultErrorMessages[code], // default error messages for each status code. You can pass in a more specific one, if you like.
    data,
  });
}
