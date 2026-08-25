import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodError, ZodTypeAny } from "zod";

import { AppError } from "./app-error";

interface ValidationErrorDetails {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

const flattenValidationError = (error: ZodError) => {
  const flattened = error.flatten() as ValidationErrorDetails;

  for (const issue of error.issues) {
    if (issue.code !== "unrecognized_keys") {
      continue;
    }

    for (const key of issue.keys) {
      flattened.fieldErrors[key] = [
        ...(flattened.fieldErrors[key] ?? []),
        `Unrecognized key: "${key}"`,
      ];
    }
  }

  return flattened;
};

export const validateBody = <TSchema extends ZodTypeAny>(
  schema: TSchema,
): RequestHandler => {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(
        new AppError(
          400,
          "Request validation failed",
          flattenValidationError(result.error),
        ),
      );
      return;
    }

    request.body = result.data;
    next();
  };
};
