import { beforeEach, describe, expect, it } from "vitest";
import { agentsService } from "../src/modules/agents/agents.service";
import { AppError } from "../src/common/http/app-error";
import { errorHandler } from "../src/common/http/error.middleware";

describe("Lily Backend Stress & Hardening Test Suite", () => {
  beforeEach(() => {
    agentsService.reset();
  });

  describe("Agents In-Memory Bounded Capacity", () => {
    it("handles 10,000 agent creations while capping in-memory array to 5,000", () => {
      const initial = agentsService.listAgents();
      expect(initial.total).toBe(1);

      const iterations = 10_000;
      for (let i = 0; i < iterations; i++) {
        agentsService.createAgent({
          name: `Agent Batch ${i}`,
          description: `Orchestrating treasury batch flow for index ${i}`,
          capabilities: ["settlement", "monitoring"]
        });
      }

      const current = agentsService.listAgents();
      expect(current.total).toBeLessThanOrEqual(5_000);
      expect(current.total).toBe(5_000);

      // Verify the latest agent is present
      const latest = agentsService.getAgentById("agentlily_10001");
      expect(latest).toBeDefined();
      expect(latest?.name).toBe("Agent Batch 9999");
      expect(typeof latest?.createdAt).toBe("string");
      expect(typeof latest?.updatedAt).toBe("string");
    });
  });

  describe("Error Middleware Resilience", () => {
    it("handles non-Error objects gracefully without throwing", () => {
      const mockReq: any = { method: "POST", originalUrl: "/api/v1/test" };
      let statusCode = 0;
      let jsonPayload: any = null;

      const mockRes: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          jsonPayload = data;
          return this;
        }
      };

      // Test string exception
      errorHandler("Custom string error" as any, mockReq, mockRes, (() => {}) as any);
      expect(statusCode).toBe(500);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.message).toBe("Custom string error");

      // Test raw object exception
      errorHandler({ foo: "bar" } as any, mockReq, mockRes, (() => {}) as any);
      expect(statusCode).toBe(500);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.message).toBe("An unexpected error occurred");

      // Test AppError
      const appErr = new AppError(422, "Unprocessable Entity", { field: "name" });
      errorHandler(appErr, mockReq, mockRes, (() => {}) as any);
      expect(statusCode).toBe(422);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.message).toBe("Unprocessable Entity");
      expect(jsonPayload.details).toEqual({ field: "name" });
    });
  });
});
