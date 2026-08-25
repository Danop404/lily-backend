import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("health endpoints", () => {
  const app = createApp();

  it("returns the service health payload", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });

  it("disables caching for API responses", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("leaves the root route outside the API no-store policy", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBeUndefined();
  });

  it("returns a typed 404 payload for missing routes", async () => {
    const response = await request(app).get("/missing");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Route not found");
  });
});
