import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("health payload contract", () => {
  const app = createApp();

  it("returns all required fields with correct types and values", async () => {
    const before = Date.now();
    const response = await request(app).get("/api/v1/health");
    const after = Date.now();

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.service).toBe("Lily Backend");
    expect(["development", "test", "production"]).toContain(
      response.body.data.environment,
    );

    const ts = new Date(response.body.data.timestamp).getTime();
    expect(Number.isNaN(ts)).toBe(false);
    expect(ts).toBeGreaterThanOrEqual(before - 1000);
    expect(ts).toBeLessThanOrEqual(after + 1000);
  });
});
