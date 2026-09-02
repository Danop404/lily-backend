import type { NextFunction, Request, Response } from "express";

import { AppError } from "@/common/http/app-error";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

export const errorHandler = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  void _next;

  const statusCode =
    error instanceof AppError
      ? error.statusCode
      : "status" in error && typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;
  const details = error instanceof AppError ? error.details : undefined;
  const isAppError = error instanceof AppError;

  const logLevel = statusCode >= 400 && statusCode < 500 ? "warn" : "error";

  logger[logLevel](
    {
      err: error,
      method: request.method,
      path: request.originalUrl,
      statusCode,
    },
    "Request failed",
  );

  response.status(statusCode).json({
    success: false,
    ...(code ? { code } : {}),
    message:
      statusCode === 500 && !isAppError && env.NODE_ENV === "production"
        ? "Internal server error"
        : rawMessage,
    ...(details !== undefined ? { details } : {}),
  });
};
