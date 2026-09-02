import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("not found handler", () => {
  const app = createApp();

  it("returns 404 with method and path for unknown routes under /api/v1", async () => {
    const response = await request(app).get("/api/v1/nope");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("GET");
    expect(response.body.message).toContain("/api/v1/nope");
  });

  it("returns 404 with method and path for unknown routes outside the API prefix", async () => {
    const response = await request(app).post("/unknown-path");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("POST");
    expect(response.body.message).toContain("/unknown-path");
  });
});
