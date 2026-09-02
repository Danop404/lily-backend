import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("PATCH /api/v1/agents/:id pause/resume (issue #114)", () => {
  const app = createApp();

  beforeEach(() => {
    agentsService.reset?.();
  });

  const createAgent = async (name: string) => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name,
        description: "Testing agent pause and resume lifecycle",
        capabilities: ["test"],
      });
    expect(res.status).toBe(201);
    return res.body.data.agent;
  };

  it("should pause an active agent", async () => {
    const agent = await createAgent("Pausable Agent");
    expect(agent.status).toBe("active");

    const res = await request(app)
      .patch(`/api/v1/agents/${agent.id}`)
      .send({ status: "paused" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.status).toBe("paused");
  });

  it("should resume a paused agent", async () => {
    const agent = await createAgent("Resumable Agent");
    await request(app)
      .patch(`/api/v1/agents/${agent.id}`)
      .send({ status: "paused" });

    const res = await request(app)
      .patch(`/api/v1/agents/${agent.id}`)
      .send({ status: "active" });

    expect(res.status).toBe(200);
    expect(res.body.data.agent.status).toBe("active");
  });

  it("should return 404 for unknown agent id", async () => {
    const res = await request(app)
      .patch("/api/v1/agents/nonexistent-id")
      .send({ status: "paused" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid status values with 400", async () => {
    const agent = await createAgent("Invalid Status Agent");
    const res = await request(app)
      .patch(`/api/v1/agents/${agent.id}`)
      .send({ status: "deleted" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should persist status change in subsequent list calls", async () => {
    const agent = await createAgent("Persistent Status Agent");
    await request(app)
      .patch(`/api/v1/agents/${agent.id}`)
      .send({ status: "paused" });

    const listRes = await request(app).get("/api/v1/agents");
    const found = listRes.body.data.agents.find(
      (a: { id: string }) => a.id === agent.id,
    );
    expect(found).toBeDefined();
    expect(found.status).toBe("paused");
  });
});
