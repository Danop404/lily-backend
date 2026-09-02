import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import { clearIdempotencyStore } from "../src/common/http/idempotency.middleware";
import { agentsService } from "../src/modules/agents/agents.service";

const app = createApp();

describe("Idempotency-Key middleware", () => {
  beforeEach(() => {
    clearIdempotencyStore();
    agentsService.reset();
  });

  it("returns the original agent on replay with same key", async () => {
    const payload = {
      name: "Test Agent",
      description: "A test agent for idempotency checks",
      capabilities: ["testing"],
    };

    const first = await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", "key-001")
      .send(payload)
      .expect(201);

    const second = await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", "key-001")
      .send(payload)
      .expect(201);

    expect(second.body).toEqual(first.body);
    expect(second.body.data.agent.id).toBe(first.body.data.agent.id);

    const list = await request(app).get("/api/v1/agents").expect(200);
    expect(list.body.data.total).toBe(2);
  });

  it("creates separate agents when no key is provided", async () => {
    const payload = {
      name: "No Key Agent",
      description: "An agent without idempotency key header",
      capabilities: ["testing"],
    };

    const first = await request(app)
      .post("/api/v1/agents")
      .send(payload)
      .expect(201);

    const second = await request(app)
      .post("/api/v1/agents")
      .send(payload)
      .expect(201);

    expect(second.body.data.agent.id).not.toBe(first.body.data.agent.id);

    const list = await request(app).get("/api/v1/agents").expect(200);
    expect(list.body.data.total).toBe(3);
  });

  it("creates separate agents with different keys", async () => {
    const payload = {
      name: "Diff Key Agent",
      description: "An agent with different idempotency keys",
      capabilities: ["testing"],
    };

    const first = await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", "key-alpha")
      .send(payload)
      .expect(201);

    const second = await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", "key-beta")
      .send(payload)
      .expect(201);

    expect(second.body.data.agent.id).not.toBe(first.body.data.agent.id);
  });

  it("does not cache error responses", async () => {
    const badPayload = {
      name: "x",
      description: "too short",
      capabilities: [],
    };

    await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", "key-err")
      .send(badPayload)
      .expect(400);

    await request(app)
      .post("/api/v1/agents")
      .set("Idempotency-Key", "key-err")
      .send(badPayload)
      .expect(400);
  });

  it("ignores idempotency on GET requests (no caching)", async () => {
    await request(app)
      .get("/api/v1/agents")
      .set("Idempotency-Key", "key-get")
      .expect(200);

    await request(app)
      .get("/api/v1/agents")
      .set("Idempotency-Key", "key-get")
      .expect(200);
  });
});
