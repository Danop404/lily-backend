import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("DELETE /api/v1/agents/:id (issue #115)", () => {
  const app = createApp();

  beforeEach(() => {
    agentsService.reset?.();
  });

  const createAgent = async (name: string) => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name,
        description: "Testing agent deletion lifecycle",
        capabilities: ["test"],
      });
    expect(res.status).toBe(201);
    return res.body.data.agent;
  };

  it("should delete an existing agent and return 204", async () => {
    const agent = await createAgent("Deletable Agent");
    const res = await request(app).delete(`/api/v1/agents/${agent.id}`);
    expect(res.status).toBe(204);
  });

  it("should remove the deleted agent from the list", async () => {
    const agent = await createAgent("To Be Removed");
    await request(app).delete(`/api/v1/agents/${agent.id}`);
    const listRes = await request(app).get("/api/v1/agents");
    const found = listRes.body.data.agents.find(
      (a: { id: string }) => a.id === agent.id,
    );
    expect(found).toBeUndefined();
  });

  it("should return 404 for unknown agent id", async () => {
    const res = await request(app).delete("/api/v1/agents/nonexistent-id");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should not affect other agents when one is deleted", async () => {
    const agent1 = await createAgent("Keep This One");
    const agent2 = await createAgent("Delete This One");
    await request(app).delete(`/api/v1/agents/${agent2.id}`);
    const listRes = await request(app).get("/api/v1/agents");
    const kept = listRes.body.data.agents.find(
      (a: { id: string }) => a.id === agent1.id,
    );
    expect(kept).toBeDefined();
    expect(kept.name).toBe("Keep This One");
  });
});
