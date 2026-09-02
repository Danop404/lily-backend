import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("API versioning strategy (issue #118)", () => {
  const app = createApp();

  it("serves v1 health at /api/v1/health", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("serves v1 agents at /api/v1/agents", async () => {
    const res = await request(app).get("/api/v1/agents");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 for unversioned /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(404);
  });

  it("returns 404 for unknown version /api/v2/health", async () => {
    const res = await request(app).get("/api/v2/health");
    expect(res.status).toBe(404);
  });

  it("returns root info with docs pointing to v1", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.docs).toContain("/api/v1/health");
  });
});
