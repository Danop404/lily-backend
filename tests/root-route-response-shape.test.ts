import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("Root route response shape (issue #141)", () => {
  const app = createApp();

  it("should return 200 with success: true on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should include a message string in the root response", async () => {
    const res = await request(app).get("/");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");
    expect(res.body.message.length).toBeGreaterThan(0);
  });

  it("should include docs pointing at the health endpoint", async () => {
    const res = await request(app).get("/");
    expect(res.body).toHaveProperty("docs");
    expect(typeof res.body.docs).toBe("string");
    expect(res.body.docs).toContain("/api/v1/health");
  });

  it("should not use the data envelope shape used by API routes", async () => {
    const res = await request(app).get("/");
    // Root route intentionally uses { success, message, docs } instead of
    // { success, data } to distinguish it from versioned API endpoints.
    expect(res.body).not.toHaveProperty("data");
  });
});
