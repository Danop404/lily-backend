import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../src/common/http/app-error";
import { errorHandler } from "../src/common/http/error.middleware";
import { logger } from "../src/config/logger";

const createErrorApp = (error: Error) => {
  const app = express();

  app.get("/error", (_request, _response, next) => {
    next(error);
  });
  app.use(errorHandler);

  return app;
};

describe("error handler log levels", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([400, 404, 429])("logs %s responses at warn level", async (statusCode) => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => logger);
    const error = vi.spyOn(logger, "error").mockImplementation(() => logger);

    const response = await request(
      createErrorApp(new AppError(statusCode, "Client request failed")),
    ).get("/error");

    expect(response.status).toBe(statusCode);
    expect(warn).toHaveBeenCalledOnce();
    expect(error).not.toHaveBeenCalled();
  });

  it("logs 500 responses at error level", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => logger);
    const error = vi.spyOn(logger, "error").mockImplementation(() => logger);

    const response = await request(createErrorApp(new Error("Server failure"))).get(
      "/error",
    );

    expect(response.status).toBe(500);
    expect(error).toHaveBeenCalledOnce();
    expect(warn).not.toHaveBeenCalled();
  });
});
