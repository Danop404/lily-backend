import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("API-prefixed 404 handler (issue #132)", () => {
  const app = createApp();

  it("should return 404 with envelope for unknown path under /api/v1", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Route not found");
    expect(res.body.message).toContain("GET");
    expect(res.body.message).toContain("/api/v1/nope");
  });

  it("should return 404 with envelope for unknown path outside prefix", async () => {
    const res = await request(app).get("/missing");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Route not found");
    expect(res.body.message).toContain("GET");
    expect(res.body.message).toContain("/missing");
  });

  it("should include method and path in 404 message for POST under prefix", async () => {
    const res = await request(app).post("/api/v1/unknown-endpoint");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("POST");
    expect(res.body.message).toContain("/api/v1/unknown-endpoint");
  });
});
