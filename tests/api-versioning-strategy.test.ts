import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("API versioning strategy (issue #118)", () => {
  const app = createApp();

  it("should serve all endpoints under /api/v1 prefix", async () => {
    const healthRes = await request(app).get("/api/v1/health");
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.success).toBe(true);

    const agentsRes = await request(app).get("/api/v1/agents");
    expect(agentsRes.status).toBe(200);
    expect(agentsRes.body.success).toBe(true);
  });

  it("should return 404 for unversioned API paths", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 for future version paths not yet implemented", async () => {
    const res = await request(app).get("/api/v2/health");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should document the current API version in root endpoint", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.docs).toContain("/api/v1/");
  });
});
