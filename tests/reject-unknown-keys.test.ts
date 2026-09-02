import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("Reject unknown keys in agent creation (issue #87)", () => {
  const app = createApp();

  beforeEach(() => {
    agentsService.reset?.();
  });

  it("should reject payloads with unknown keys", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Strict Agent",
        description: "Testing strict schema rejection of unknown keys",
        capabilities: ["test"],
        admin: true,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should accept valid payloads without unknown keys", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Valid Agent",
        description: "Testing that valid payloads still pass strict schema",
        capabilities: ["test"],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should include unrecognized keys error in response details", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Extra Fields Agent",
        description: "Testing error details for unknown key rejection",
        capabilities: ["test"],
        secretRole: "superadmin",
        injectedFlag: true,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });
});
