import { describe, expect, it } from 'vitest';
import request from "supertest";
import { createApp } from "../src/app";

describe("Method Not Allowed (405)", () => {
  const app = createApp();

  it("returns 405 when POST is used on GET-only /api/v1/health", async () => {
    const res = await request(app).post("/api/v1/health");
    expect(res.status).toBe(405);
    expect(res.body).toMatchObject({
      success: false,
      message: expect.stringContaining("Method POST not allowed"),
    });
  });

  it("returns 405 when PUT is used on GET/POST /api/v1/agents", async () => {
    const res = await request(app).put("/api/v1/agents");
    expect(res.status).toBe(405);
    expect(res.body).toMatchObject({
      success: false,
      message: expect.stringContaining("Method PUT not allowed"),
    });
  });

  it("still returns 404 for completely unknown paths", async () => {
    const res = await request(app).get("/api/v1/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: expect.stringContaining("Route not found"),
    });
  });
});
