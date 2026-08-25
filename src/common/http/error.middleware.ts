import type { NextFunction, Request, Response } from "express";

import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { AppError } from "./app-error";

type HttpLikeError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
};

const isHttpStatusCode = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 400 && Number(value) <= 599;

const getStatusCode = (error: Error): number => {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  const httpError = error as HttpLikeError;

  if (isHttpStatusCode(httpError.statusCode)) {
    return httpError.statusCode;
  }

  if (isHttpStatusCode(httpError.status)) {
    return httpError.status;
  }

  return 500;
};

const getMessage = (error: Error, statusCode: number): string => {
  const httpError = error as HttpLikeError;

  if (httpError.type === "entity.parse.failed") {
    return "Malformed JSON request body";
  }

  if (httpError.type === "entity.too.large") {
    return "Request body too large";
  }

  if (statusCode === 500 && env.NODE_ENV === "production") {
    return "Internal server error";
  }

  return error.message;
};

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  void _next;

  const statusCode = getStatusCode(error);
  const details = error instanceof AppError ? error.details : undefined;
  const message = getMessage(error, statusCode);

  logger.error(
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
    message,
    ...(details ? { details } : {}),
  });
};
