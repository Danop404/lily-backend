import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("root route", () => {
  const app = createApp();

  it("returns 200 with success true and docs pointing at the health endpoint", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual(expect.any(String));
    // Root route intentionally uses a non-data envelope; docs must reference the API-prefixed health path.
    expect(response.body.docs).toBe("/api/v1/health");
    expect(response.body).not.toHaveProperty("data");
  });
});
