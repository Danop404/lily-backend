import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("TRUST_PROXY configuration validation (issue #80)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should accept 'false' and transform to boolean false", async () => {
    process.env.TRUST_PROXY = "false";
    process.env.NODE_ENV = "test";
    const { env } = await import("../src/config/env");
    expect(env.TRUST_PROXY).toBe(false);
  });

  it("should accept numeric hop counts as strings", async () => {
    process.env.TRUST_PROXY = "1";
    process.env.NODE_ENV = "test";
    const { env } = await import("../src/config/env");
    expect(env.TRUST_PROXY).toBe(1);
  });

  it("should accept 'loopback' as a valid value", async () => {
    process.env.TRUST_PROXY = "loopback";
    process.env.NODE_ENV = "test";
    const { env } = await import("../src/config/env");
    expect(env.TRUST_PROXY).toBe("loopback");
  });

  it("should reject 'true' as unsafe", async () => {
    process.env.TRUST_PROXY = "true";
    process.env.NODE_ENV = "test";
    await expect(import("../src/config/env")).rejects.toThrow(
      "Invalid environment configuration",
    );
  });

  it("should reject arbitrary string values", async () => {
    process.env.TRUST_PROXY = "yolo";
    process.env.NODE_ENV = "test";
    await expect(import("../src/config/env")).rejects.toThrow(
      "Invalid environment configuration",
    );
  });

  it("should default to false when unset", async () => {
    delete process.env.TRUST_PROXY;
    process.env.NODE_ENV = "test";
    const { env } = await import("../src/config/env");
    expect(env.TRUST_PROXY).toBe(false);
  });
});
