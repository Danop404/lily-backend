import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import { apiRouter } from "../src/routes";

describe("core application routes and error handling", () => {
  const app = createApp();

  it("serves the root service status route", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("running");
  });

  it("handles unhandled server errors gracefully through error middleware", async () => {
    apiRouter.get("/error-trigger", () => {
      throw new Error("Simulated unhandled exception");
    });

    const response = await request(app).get("/api/v1/error-trigger");
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
