import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("GET /api/v1/agents/:id (issue #113)", () => {
  const app = createApp();

  beforeEach(() => {
    agentsService.reset?.();
  });

  it("should return an existing agent by id", async () => {
    const createRes = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Fetchable Agent",
        description: "Testing GET agent by id endpoint",
        capabilities: ["test"],
      });
    expect(createRes.status).toBe(201);
    const agentId = createRes.body.data.agent.id;

    const res = await request(app).get(`/api/v1/agents/${agentId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.id).toBe(agentId);
    expect(res.body.data.agent.name).toBe("Fetchable Agent");
  });

  it("should return 404 for unknown agent id", async () => {
    const res = await request(app).get("/api/v1/agents/nonexistent-id");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Agent not found");
  });

  it("should return the seed agent by its known id", async () => {
    const res = await request(app).get("/api/v1/agents/agentlily_demo_001");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.name).toBe("Treasury Settlement Agent");
  });
});
