import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../src/common/http/app-error";
import { errorHandler } from "../src/common/http/error.middleware";
import { logger } from "../src/config/logger";

describe("error middleware logging", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    [new AppError(400, "Bad request", { field: "name" }), 400, "warn"],
    [new AppError(404, "Not found"), 404, "warn"],
    [new AppError(429, "Too many requests"), 429, "warn"],
    [new AppError(500, "Internal failure"), 500, "error"],
    [new AppError(503, "Unavailable"), 503, "error"],
    [new Error("Unexpected failure"), 500, "error"],
  ] as const)("logs %s at %s using %s", async (error, statusCode, level) => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    const errorLog = vi.spyOn(logger, "error").mockImplementation(() => {});
    const app = express();
    app.get("/failure", () => {
      throw error;
    });
    app.use(errorHandler);

    const response = await request(app).get("/failure?source=test");

    expect(response.status).toBe(statusCode);
    expect(response.body).toMatchObject({
      success: false,
      message: error.message,
    });
    if (error instanceof AppError && error.details) {
      expect(response.body.details).toEqual(error.details);
    }
    const selected = level === "warn" ? warn : errorLog;
    const other = level === "warn" ? errorLog : warn;
    expect(selected).toHaveBeenCalledExactlyOnceWith(
      { err: error, method: "GET", path: "/failure?source=test", statusCode },
      "Request failed",
    );
    expect(other).not.toHaveBeenCalled();
  });
});
