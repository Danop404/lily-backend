import type { NextFunction, Request, Response } from "express";

import { AppError } from "@/common/http/app-error";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

interface BodyParserError extends SyntaxError {
  status: number;
  type: string;
}

const isMalformedJsonError = (error: Error): error is BodyParserError =>
  error instanceof SyntaxError &&
  "status" in error &&
  error.status === 400 &&
  "type" in error &&
  error.type === "entity.parse.failed";

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
