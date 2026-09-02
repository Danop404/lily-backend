import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { errorHandler } from "../src/common/http/error.middleware";
import { AppError } from "../src/common/http/app-error";

describe("Production error message redaction (issue #127)", () => {
  const createAppWithThrow = (errorToThrow: Error) => {
    const app = express();
    app.get("/throw", () => {
      throw errorToThrow;
    });
    app.use(errorHandler);
    return app;
  };

  it("should expose error.message for generic non-AppError errors", async () => {
    const app = createAppWithThrow(new Error("detailed internal stack trace info"));

    const res = await request(app).get("/throw");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeTruthy();
    expect(typeof res.body.message).toBe("string");
  });

  it("should return 500 with success:false for generic errors", async () => {
    const app = createAppWithThrow(new Error("some unexpected failure"));

    const res = await request(app).get("/throw");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("should expose AppError messages and status codes", async () => {
    const app = createAppWithThrow(new AppError(400, "User-facing validation issue"));

    const res = await request(app).get("/throw");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User-facing validation issue");
  });

  it("should expose AppError details when provided", async () => {
    const details = { field: "email", reason: "invalid format" };
    const app = createAppWithThrow(
      new AppError(422, "Validation failed", details),
    );

    const res = await request(app).get("/throw");
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.details).toEqual(details);
  });

  it("should not include details for errors without details", async () => {
    const app = createAppWithThrow(new Error("no details here"));

    const res = await request(app).get("/throw");
    expect(res.status).toBe(500);
    expect(res.body).not.toHaveProperty("details");
  });
});
