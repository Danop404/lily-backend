import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import { env } from "../src/config/env";

describe("health endpoints", () => {
  const app = createApp();

  it("returns the documented root route shape", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: expect.any(String),
      docs: `${env.API_PREFIX}/health`,
    });
    expect(response.body).not.toHaveProperty("data");
  });

  it("returns the service health payload", async () => {
    const beforeRequest = Date.now();
    const response = await request(app).get("/api/v1/health");
    const afterRequest = Date.now();
    const { data } = response.body;
    const timestamp = Date.parse(data.timestamp);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(data).toMatchObject({
      status: expect.any(String),
      service: env.APP_NAME,
      environment: env.NODE_ENV,
      timestamp: expect.any(String),
    });
    expect(data.status.length).toBeGreaterThan(0);
    expect(data.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    expect(Number.isNaN(timestamp)).toBe(false);
    expect(timestamp).toBeGreaterThanOrEqual(beforeRequest - 1000);
    expect(timestamp).toBeLessThanOrEqual(afterRequest + 1000);
  });

  it("keeps helmet security headers on API responses", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.headers["content-security-policy"]).toEqual(
      expect.any(String),
    );
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["cross-origin-resource-policy"]).toBe(
      "cross-origin",
    );
  });

  it("returns a typed 404 payload for missing routes", async () => {
    const response = await request(app).get("/missing");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Route not found: GET /missing");
  });

  it("returns a typed 404 payload for API-prefixed missing routes", async () => {
    const response = await request(app).get(`${env.API_PREFIX}/missing`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      `Route not found: GET ${env.API_PREFIX}/missing`,
    );
  });
});
