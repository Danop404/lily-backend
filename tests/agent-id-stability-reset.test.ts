import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("Agent id stability after service reset (issue #129)", () => {
  const app = createApp();

  beforeEach(() => {
    agentsService.reset?.();
  });

  const createAgent = async (name: string) => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name,
        description: "Testing agent id stability after reset",
        capabilities: ["test"],
      });
    expect(res.status).toBe(201);
    return res.body.data.agent;
  };

  it("should produce deterministic ids after each reset cycle", async () => {
    const agent1 = await createAgent("First Agent");
    expect(agent1.id).toBe("agentlily_2");

    const agent2 = await createAgent("Second Agent");
    expect(agent2.id).toBe("agentlily_3");

    agentsService.reset?.();

    const agent3 = await createAgent("After Reset Agent");
    expect(agent3.id).toBe("agentlily_2");
  });

  it("should restart id sequence from seed length + 1 after reset", async () => {
    await createAgent("Cycle 1 Agent A");
    await createAgent("Cycle 1 Agent B");
    await createAgent("Cycle 1 Agent C");

    agentsService.reset?.();

    const afterReset = await createAgent("Cycle 2 First");
    expect(afterReset.id).toBe("agentlily_2");
  });

  it("should maintain sequential ids within a single cycle", async () => {
    const agents = [];
    for (let i = 0; i < 5; i++) {
      agents.push(await createAgent(`Sequential Agent ${i}`));
    }

    for (let i = 0; i < agents.length; i++) {
      expect(agents[i].id).toBe(`agentlily_${i + 2}`);
    }
  });
});
