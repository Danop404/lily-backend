import { describe, expect, it, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import rateLimit from "express-rate-limit";

describe("API Rate Limiter", () => {
  let app: express.Express;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Override NODE_ENV so the default skip condition does not apply
    process.env.NODE_ENV = "development";

    app = express();
    const limiter = rateLimit({
      windowMs: 1000,
      limit: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, please try again later.",
      },
    });

    app.use(limiter);
    app.get("/test", (_req, res) => {
      res.json({ success: true });
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should return 429 with correct body and headers when limit exceeded", async () => {
    // Send requests up to and beyond the limit
    for (let i = 0; i < 3; i++) {
      const okRes = await request(app).get("/test");
      expect(okRes.status).toBe(200);
    }

    const res = await request(app).get("/test");

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Too many requests, please try again later.");

    // standardHeaders: true emits RateLimit-* headers
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
    expect(res.headers["ratelimit-reset"]).toBeDefined();
  });
});
