import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("Zod unknown-key stripping on agent creation (issue #133)", () => {
  const app = createApp();

  it("should strip unknown keys from the created agent response", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Test Agent",
        description: "A test agent for unknown key stripping",
        capabilities: ["test-cap"],
        admin: true,
        secretField: "should-be-stripped",
        extraNested: { foo: "bar" },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.agent).toBeDefined();

    const agent = res.body.data.agent;
    expect(agent).not.toHaveProperty("admin");
    expect(agent).not.toHaveProperty("secretField");
    expect(agent).not.toHaveProperty("extraNested");

    expect(agent.name).toBe("Test Agent");
    expect(agent.description).toBe("A test agent for unknown key stripping");
    expect(agent.capabilities).toEqual(["test-cap"]);
  });

  it("should not persist unknown keys in subsequent list calls", async () => {
    agentsService.reset?.();

    await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Persist Test",
        description: "Testing that unknown keys are not persisted",
        capabilities: ["persist-test"],
        injectedRole: "superadmin",
      });

    const listRes = await request(app).get("/api/v1/agents");
    expect(listRes.status).toBe(200);

    const created = listRes.body.data.agents.find(
      (a: { name: string }) => a.name === "Persist Test",
    );
    expect(created).toBeDefined();
    expect(created).not.toHaveProperty("injectedRole");
  });
});
