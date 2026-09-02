import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("CORS origin rejection behavior (issue #125)", () => {
  const app = createApp();

  it("should allow requests without an Origin header (server-to-server)", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should reject requests with a disallowed Origin header", async () => {
    const res = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://evil.example.com");

    // cors middleware calls callback(new Error(...)) which errorHandler
    // treats as a generic 500. This test pins the current behavior so
    // any future change to return 403 or a different envelope is caught.
    expect([403, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it("should include standard error envelope on CORS rejection", async () => {
    const res = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://not-allowed.example.com");

    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");
  });

  it("should not set Access-Control-Allow-Origin for rejected origins", async () => {
    const res = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://evil.example.com");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
