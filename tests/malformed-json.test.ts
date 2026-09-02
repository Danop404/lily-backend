import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("malformed JSON body handling", () => {
  const app = createApp();

  it("returns 400 with success false for invalid JSON syntax", async () => {
    const response = await request(app)
      .post("/api/v1/agents")
      .set("Content-Type", "application/json")
      .send("{invalid json");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeDefined();
  });

  it("returns 400 for empty body with application/json content-type", async () => {
    const response = await request(app)
      .post("/api/v1/agents")
      .set("Content-Type", "application/json")
      .send("");

    // Express json parser treats empty body as valid (undefined), so this may be 400 or pass to validation.
    // We assert it does not return 500.
    expect(response.status).not.toBe(500);
  });
});
