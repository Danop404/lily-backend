import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("Wallet address generation uniqueness and normalization (issue #128)", () => {
  const app = createApp();

  const createAgent = async (name: string) => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name,
        description: "Testing wallet address generation",
        capabilities: ["test"],
      });
    expect(res.status).toBe(201);
    return res.body.data.agent;
  };

  beforeEach(() => {
    agentsService.reset?.();
  });

  it("should produce a 56-character address starting with G", async () => {
    const agent = await createAgent("Test Agent");
    expect(agent.walletAddress).toHaveLength(56);
    expect(agent.walletAddress).toMatch(/^G[A-Z0-9]{55}$/);
  });

  it("should strip punctuation and normalize names to uppercase", async () => {
    const agent1 = await createAgent("hello-world");
    agentsService.reset?.();
    const agent2 = await createAgent("HELLO WORLD");
    expect(agent1.walletAddress).toBe(agent2.walletAddress);
  });

  it("should produce distinct addresses for distinct alphanumeric seeds", async () => {
    const agent1 = await createAgent("Alpha");
    const agent2 = await createAgent("Beta");
    expect(agent1.walletAddress).not.toBe(agent2.walletAddress);
  });

  it("should handle minimum-length names without error", async () => {
    const agent = await createAgent("AB");
    expect(agent.walletAddress).toHaveLength(56);
    expect(agent.walletAddress).toMatch(/^G[A-Z0-9]{55}$/);
  });

  it("should pad short seeds with zeros to reach 55 characters after G", async () => {
    const agent = await createAgent("AB");
    expect(agent.walletAddress).toBe("GAB" + "0".repeat(53));
  });
});
