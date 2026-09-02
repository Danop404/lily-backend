import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app";
import { agentsService } from "@/modules/agents/agents.service";

describe("agent endpoints", () => {
  let app: Express;

  beforeEach(async () => {
    app = await createIsolatedTestApp();
  });

  it("does not expose test-only reset behavior from the production service", async () => {
    const { agentsService } = await import(
      "../src/modules/agents/agents.service"
    );

    expect(agentsService).not.toHaveProperty("reset");
  });

  it("returns seeded agents so contributors can inspect a real module", async () => {
    const response = await request(app).get("/api/v1/agents");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.total).toBe(1);
    expect(response.body.data.agents[0]).toMatchObject({
      id: "agentlily_demo_001",
      name: "Treasury Settlement Agent",
      walletAddress: expect.stringMatching(/^G[A-Z0-9]+$/),
      status: "active",
    });
  });

  it("creates an agent with validated input", async () => {
    const response = await request(app).post("/api/v1/agents").send({
      name: "Liquidity Bot",
      description:
        "AgentLily responsible for orchestrating liquidity and payment workflows.",
      capabilities: ["usdc-payments", "payments"],
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.agent).toMatchObject({
      id: "agentlily_2",
      name: "Liquidity Bot",
      description:
        "AgentLily responsible for orchestrating liquidity and payment workflows.",
      status: "active",
      capabilities: ["usdc-payments", "payments"],
    });
    expect(response.body.data.agent.walletAddress).toMatch(/^GLIQUIDITYBOT0+/);
  });

  it("persists a created agent in the list endpoint", async () => {
    await request(app).post("/api/v1/agents").send({
      name: "Marketplace Runner",
      description:
        "AgentLily responsible for purchasing tools and settling marketplace invoices.",
      capabilities: ["settlement", "settlement"],
    });

    const response = await request(app).get("/api/v1/agents");

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(2);
    expect(response.body.data.agents[1]).toMatchObject({
      id: "agentlily_2",
      name: "Marketplace Runner",
    });
  });

  it("rejects invalid agent payloads with typed validation errors", async () => {
    const response = await request(app).post("/api/v1/agents").send({
      name: "A",
      description: "too short",
      capabilities: [],
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(response.body.message).toBe("Request validation failed");
    expect(response.body.details.fieldErrors).toMatchObject({
      name: [expect.any(String)],
      description: [expect.any(String)],
      capabilities: [expect.any(String)],
    });
  });

  it("pauses an existing agent", async () => {
    const response = await request(app)
      .patch("/api/v1/agents/agentlily_demo_001")
      .send({ status: "paused" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.agent.id).toBe("agentlily_demo_001");
    expect(response.body.data.agent.status).toBe("paused");
  });

  it("resumes the same agent", async () => {
    await request(app)
      .patch("/api/v1/agents/agentlily_demo_001")
      .send({ status: "active" });

    const response = await request(app)
      .patch("/api/v1/agents/agentlily_demo_001")
      .send({ status: "active" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.agent.status).toBe("active");
  });

  it("rejects invalid status with 400", async () => {
    const response = await request(app)
      .patch("/api/v1/agents/agentlily_demo_001")
      .send({ status: "disabled" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Request validation failed");
  });

  it("returns 404 for unknown agent ID", async () => {
    const response = await request(app)
      .patch("/api/v1/agents/does-not-exist")
      .send({ status: "paused" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("persists status change in the list endpoint", async () => {
    await request(app)
      .patch("/api/v1/agents/agentlily_demo_001")
      .send({ status: "paused" });

    const response = await request(app).get("/api/v1/agents");

    expect(response.status).toBe(200);
    expect(response.body.data.agents[0]).toMatchObject({
      id: "agentlily_demo_001",
      status: "paused",
    });
  });
});

