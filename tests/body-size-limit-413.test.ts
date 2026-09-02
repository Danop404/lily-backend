import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("Body size limit 413 response (issue #124)", () => {
  const app = createApp();

  it("should return 413 for payloads exceeding bodySizeLimit", async () => {
    // Default limit is 1mb; send ~1.5mb of JSON
    const oversizedBody = JSON.stringify({
      name: "Oversized Agent",
      description: "Testing body size limit enforcement",
      capabilities: ["test"],
      payload: "x".repeat(1_500_000),
    });

    const res = await request(app)
      .post("/api/v1/agents")
      .set("Content-Type", "application/json")
      .send(oversizedBody);

    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
  });

  it("should include standard error envelope on 413 responses", async () => {
    const oversizedBody = JSON.stringify({
      name: "Oversized Agent",
      description: "Testing body size limit envelope",
      capabilities: ["test"],
      payload: "y".repeat(1_500_000),
    });

    const res = await request(app)
      .post("/api/v1/agents")
      .set("Content-Type", "application/json")
      .send(oversizedBody);

    expect(res.status).toBe(413);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.message).toBe("string");
  });

  it("should accept payloads under the limit", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Normal Sized Agent",
        description: "This payload is well within the body size limit",
        capabilities: ["test"],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
