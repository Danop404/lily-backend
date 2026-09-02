import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Env schema parser (issue #137)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should apply defaults for PORT, APP_NAME, and API_PREFIX", async () => {
    delete process.env.PORT;
    delete process.env.APP_NAME;
    delete process.env.API_PREFIX;
    process.env.NODE_ENV = "test";

    const { env } = await import("../src/config/env");
    expect(env.PORT).toBe(4000);
    expect(env.APP_NAME).toBe("Lily Backend");
    expect(env.API_PREFIX).toBe("/api/v1");
  });

  it("should coerce PORT string to number", async () => {
    process.env.PORT = "8080";
    process.env.NODE_ENV = "test";

    const { env } = await import("../src/config/env");
    expect(env.PORT).toBe(8080);
    expect(typeof env.PORT).toBe("number");
  });

  it("should reject invalid NODE_ENV values", async () => {
    process.env.NODE_ENV = "staging";

    await expect(import("../src/config/env")).rejects.toThrow(
      "Invalid environment configuration",
    );
  });

  it("should transform TRUST_PROXY string to boolean", async () => {
    process.env.TRUST_PROXY = "true";
    process.env.NODE_ENV = "test";

    const { env } = await import("../src/config/env");
    expect(env.TRUST_PROXY).toBe(true);
    expect(typeof env.TRUST_PROXY).toBe("boolean");
  });

  it("should default TRUST_PROXY to false", async () => {
    delete process.env.TRUST_PROXY;
    process.env.NODE_ENV = "test";

    const { env } = await import("../src/config/env");
    expect(env.TRUST_PROXY).toBe(false);
  });

  it("should parse rate limit values as positive integers", async () => {
    process.env.RATE_LIMIT_WINDOW_MS = "60000";
    process.env.RATE_LIMIT_MAX_REQUESTS = "50";
    process.env.NODE_ENV = "test";

    const { env } = await import("../src/config/env");
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(50);
  });

  it("should reject non-positive rate limit values", async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = "0";
    process.env.NODE_ENV = "test";

    await expect(import("../src/config/env")).rejects.toThrow(
      "Invalid environment configuration",
    );
  });
});
