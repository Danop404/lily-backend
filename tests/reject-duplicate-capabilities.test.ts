import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("Reject duplicate capabilities and normalize casing (issue #84)", () => {
  const app = createApp();

  beforeEach(() => {
    agentsService.reset?.();
  });

  it("should deduplicate identical capabilities", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Dedup Agent",
        description: "Testing capability deduplication behavior",
        capabilities: ["payments", "payments", "payments"],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.agent.capabilities).toEqual(["payments"]);
  });

  it("should normalize capabilities to lowercase", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Case Agent",
        description: "Testing capability case normalization behavior",
        capabilities: ["Payments", "WALLET", "Settlement"],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.agent.capabilities).toEqual(["payments", "wallet", "settlement"]);
  });

  it("should deduplicate case-variant capabilities", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Case Dedup Agent",
        description: "Testing case variant deduplication behavior",
        capabilities: ["payments", "Payments", "PAYMENTS"],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.agent.capabilities).toEqual(["payments"]);
  });

  it("should still reject empty capabilities array after transform", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Empty Caps Agent",
        description: "Testing empty capabilities rejection behavior",
        capabilities: [],
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
