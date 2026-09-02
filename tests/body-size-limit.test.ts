import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { errorHandler } from "../src/common/http/error.middleware";

describe("Body Size Limit", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    // Use a small limit for fast testing
    app.use(express.json({ limit: "1kb" }));
    app.post("/test", (req, res) => {
      res.json({ success: true });
    });
    app.use(errorHandler);
  });

  it("should return 413 when payload exceeds body size limit", async () => {
    // Create a payload larger than 1kb
    const largePayload = JSON.stringify({ data: "x".repeat(2048) });

    const res = await request(app)
      .post("/test")
      .set("Content-Type", "application/json")
      .send(largePayload);

    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
  });
});
