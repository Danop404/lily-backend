import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";

import { securityConfig } from "./env";

const rateLimitHandler = (
  _request: Request,
  response: Response,
): void => {
  const retryAfter = response.getHeader("Retry-After");
  response.status(429).json({
    success: false,
    message: "Too many requests, please try again later.",
    details: retryAfter !== undefined ? { retryAfterSeconds: Number(retryAfter) } : undefined,
  });
};

export const apiRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimitWindowMs,
  limit: securityConfig.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many requests, please try again later.",
  },
});
