import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";
import { _resetIdempotencyStore } from "../src/common/http/idempotency.middleware";

describe("Idempotency-Key middleware for agent creation (issue #119)", () => {
  const app = createApp();

  beforeEach(() => {
    agentsService.reset?.();
    _resetIdempotencyStore();
  });

  const validAgentPayload = {
    name: "Idempotent Agent",
    description: "Testing idempotency key deduplication",
    capabilities: ["test"],
  };

  it("should create agent normally when no Idempotency-Key header is present", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send(validAgentPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.name).toBe("Idempotent Agent");
  });

  it("should return cached response on replayed Idempotency-Key", async () => {
    const key = "test-idempotency-key-001";

    const first = await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", key)
      .send(validAgentPayload);

    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", key)
      .send(validAgentPayload);

    expect(second.status).toBe(201);
    expect(second.body).toEqual(first.body);
  });

  it("should not create duplicate agents on replayed key", async () => {
    const key = "test-idempotency-key-002";

    await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", key)
      .send(validAgentPayload);

    await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", key)
      .send(validAgentPayload);

    const listRes = await request(app).get("/api/v1/agents");
    // Seed has 1 agent + 1 created = 2 total (not 3)
    expect(listRes.body.data.agents).toHaveLength(2);
  });

  it("should treat different keys as independent requests", async () => {
    const res1 = await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", "key-alpha")
      .send({ ...validAgentPayload, name: "Alpha Agent" });

    const res2 = await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", "key-beta")
      .send({ ...validAgentPayload, name: "Beta Agent" });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res1.body.data.agent.id).not.toBe(res2.body.data.agent.id);
  });

  it("should not affect GET requests even with Idempotency-Key header", async () => {
    const res = await request(app)
      .get("/api/v1/agents")
      .set("Idempotency-Key", "should-be-ignored");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
