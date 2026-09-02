import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("security headers (helmet)", () => {
  const app = createApp();

  it("sets strict-transport-security header", async () => {
    const response = await request(app).get("/");
    expect(response.headers["strict-transport-security"]).toBeDefined();
    expect(response.headers["strict-transport-security"]).toContain("max-age=");
  });

  it("sets x-content-type-options to nosniff", async () => {
    const response = await request(app).get("/");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("sets x-frame-options to SAMEORIGIN", async () => {
    const response = await request(app).get("/");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("removes x-powered-by header", async () => {
    const response = await request(app).get("/");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("sets cross-origin-resource-policy to cross-origin", async () => {
    const response = await request(app).get("/");
    expect(response.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });
});
