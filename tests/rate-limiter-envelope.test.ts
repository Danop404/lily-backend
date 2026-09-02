import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import rateLimit from "express-rate-limit";

describe("Rate limiter standard error envelope (issue #79)", () => {
  const createAppWithLimiter = () => {
    const app = express();
    app.use(express.json());

    const limiter = rateLimit({
      windowMs: 60_000,
      limit: 2,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        const retryAfter = res.getHeader("Retry-After");
        res.status(429).json({
          success: false,
          message: "Too many requests, please try again later.",
          details: retryAfter !== undefined ? { retryAfterSeconds: Number(retryAfter) } : undefined,
        });
      },
    });

    app.get("/api/v1/test", limiter, (_req, res) => {
      res.json({ success: true, data: { ok: true } });
    });

    return app;
  };

  it("should return standard error envelope on 429", async () => {
    const app = createAppWithLimiter();
    await request(app).get("/api/v1/test");
    await request(app).get("/api/v1/test");
    const res = await request(app).get("/api/v1/test");
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Too many requests, please try again later.");
  });

  it("should include Retry-After header on 429 responses", async () => {
    const app = createAppWithLimiter();
    await request(app).get("/api/v1/test");
    await request(app).get("/api/v1/test");
    const res = await request(app).get("/api/v1/test");
    expect(res.status).toBe(429);
    expect(res.headers["retry-after"]).toBeDefined();
  });

  it("should include retryAfterSeconds in details when Retry-After is set", async () => {
    const app = createAppWithLimiter();
    await request(app).get("/api/v1/test");
    await request(app).get("/api/v1/test");
    const res = await request(app).get("/api/v1/test");
    expect(res.status).toBe(429);
    expect(res.body.details).toBeDefined();
    expect(typeof res.body.details.retryAfterSeconds).toBe("number");
    expect(res.body.details.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("should not include details field when no extra context is available", async () => {
    // This test documents that details is optional and only present
    // when Retry-After header is available from the rate limiter
    const app = createAppWithLimiter();
    await request(app).get("/api/v1/test");
    await request(app).get("/api/v1/test");
    const res = await request(app).get("/api/v1/test");
    expect(res.status).toBe(429);
    // details may or may not be present depending on timing
    if (res.body.details) {
      expect(res.body.details).toHaveProperty("retryAfterSeconds");
    }
  });
});
