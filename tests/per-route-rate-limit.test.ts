import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import rateLimit from "express-rate-limit";

describe("Per-route write rate limiter (issue #82)", () => {
  const createAppWithWriteLimiter = () => {
    const app = express();
    app.use(express.json());

    const writeLimiter = rateLimit({
      windowMs: 60_000,
      limit: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many write requests, please try again later.",
      },
    });

    app.get("/api/v1/agents", (_req, res) => {
      res.json({ success: true, data: { agents: [] } });
    });

    app.post("/api/v1/agents", writeLimiter, (req, res) => {
      res.status(201).json({ success: true, data: { agent: req.body } });
    });

    return app;
  };

  it("should allow POST requests under the write limit", async () => {
    const app = createAppWithWriteLimiter();
    const res = await request(app)
      .post("/api/v1/agents")
      .send({ name: "Test" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should return 429 for POST requests exceeding the write limit", async () => {
    const app = createAppWithWriteLimiter();
    for (let i = 0; i < 3; i++) {
      await request(app).post("/api/v1/agents").send({ name: `Agent ${i}` });
    }
    const res = await request(app)
      .post("/api/v1/agents")
      .send({ name: "Over Limit" });
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Too many write requests");
  });

  it("should not apply write limiter to GET requests", async () => {
    const app = createAppWithWriteLimiter();
    // Exhaust write limit
    for (let i = 0; i < 4; i++) {
      await request(app).post("/api/v1/agents").send({ name: `Agent ${i}` });
    }
    // GET should still work
    const res = await request(app).get("/api/v1/agents");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should include RateLimit headers on write-limited responses", async () => {
    const app = createAppWithWriteLimiter();
    const res = await request(app)
      .post("/api/v1/agents")
      .send({ name: "Header Test" });
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });
});
