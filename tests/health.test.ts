import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app";
import { env } from "../src/config/env";

describe("health endpoints", () => {
  const app = createApp();

  it("returns the full service health payload contract", async () => {
    const beforeRequest = Date.now();
    const response = await request(app).get("/api/v1/health");
    const afterRequest = Date.now();

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      status: expect.any(String),
      service: env.APP_NAME,
      environment: env.NODE_ENV,
      timestamp: expect.any(String),
    });

    const timestamp = response.body.data.timestamp as string;
    const timestampMs = Date.parse(timestamp);

    expect(Number.isNaN(timestampMs)).toBe(false);
    expect(new Date(timestampMs).toISOString()).toBe(timestamp);
    expect(timestampMs).toBeGreaterThanOrEqual(beforeRequest);
    expect(timestampMs).toBeLessThanOrEqual(afterRequest);
  });


  it("returns a typed 404 payload for missing routes", async () => {
    const response = await request(app).get("/missing");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("NOT_FOUND");
    expect(response.body.message).toContain("Route not found");
  });
});

describe("health build metadata", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it.each([undefined, "", "   ", "  abc123def456  "])(
    "handles BUILD_COMMIT=%s",
    async (commit) => {
      vi.stubEnv("BUILD_COMMIT", commit);
      vi.resetModules();
      const { createApp: createIsolatedApp } = await import("../src/app");
      const response = await request(createIsolatedApp()).get("/api/v1/health");

      expect(response.status).toBe(200);
      expect(response.body.data.version).toBe(version);
      if (commit?.trim()) {
        expect(response.body.data.commit).toBe(commit.trim());
      } else {
        expect(response.body.data).not.toHaveProperty("commit");
      }
    },
  );
});
