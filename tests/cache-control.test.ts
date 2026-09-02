import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("Cache-Control: no-store (issue #76)", () => {
  const app = createApp();

  it("should set Cache-Control: no-store on root route", async () => {
    const res = await request(app).get("/");
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("should set Cache-Control: no-store on health endpoint", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("should set Cache-Control: no-store on agents endpoint", async () => {
    const res = await request(app).get("/api/v1/agents");
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("should set Cache-Control: no-store on 404 responses", async () => {
    const res = await request(app).get("/nonexistent-route");
    expect(res.headers["cache-control"]).toBe("no-store");
  });
});
