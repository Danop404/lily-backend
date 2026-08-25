import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("http error handling", () => {
  const app = createApp();

  it("returns 400 for malformed JSON bodies", async () => {
    const response = await request(app)
      .post("/api/v1/agents")
      .set("Content-Type", "application/json")
      .send('{"name": "Broken"');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: "Malformed JSON request body",
    });
  });

  it("returns 413 for oversized JSON bodies", async () => {
    const response = await request(app)
      .post("/api/v1/agents")
      .send({ description: "a".repeat(2 * 1024 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body).toMatchObject({
      success: false,
      message: "Request body too large",
    });
  });

  it("returns 403 with the standard envelope for denied CORS origins", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://evil.example");

    expect(response.status).toBe(403);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    expect(response.body).toMatchObject({
      success: false,
      message: "Origin is not allowed by CORS policy",
    });
  });

  it("keeps allowed-origin CORS behavior unchanged", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("Origin", "http://localhost:3000");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
  });
});
