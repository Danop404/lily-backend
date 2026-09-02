import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { agentsService } from "../src/modules/agents/agents.service";

describe("Trim name and description before validation (issue #83)", () => {
  const app = createApp();

  beforeEach(() => {
    agentsService.reset?.();
  });

  it("should trim whitespace from name and description before storing", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "  Padded Agent Name  ",
        description: "  This description has leading and trailing spaces  ",
        capabilities: ["test"],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.agent.name).toBe("Padded Agent Name");
    expect(res.body.data.agent.description).toBe("This description has leading and trailing spaces");
  });

  it("should reject whitespace-only name after trimming", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "     ",
        description: "Valid description with enough characters",
        capabilities: ["test"],
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject whitespace-only description after trimming", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Valid Agent",
        description: "          ",
        capabilities: ["test"],
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should still accept valid unpadded inputs", async () => {
    const res = await request(app)
      .post("/api/v1/agents")
      .send({
        name: "Normal Agent",
        description: "A perfectly normal description without padding",
        capabilities: ["test"],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.agent.name).toBe("Normal Agent");
  });
});
