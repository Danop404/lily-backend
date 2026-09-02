import type { IncomingMessage } from "node:http";

import { describe, expect, it } from "vitest";

import { shouldIgnoreRequestLog } from "../src/config/request-logging";

const requestWithUrl = (url: string): IncomingMessage => ({ url }) as IncomingMessage;

describe("request logging ignore rules", () => {
  it.each(["/", "/?probe=1", "/api/v1/health", "/api/v1/health/", "/api/v1/health?probe=1"]) (
    "ignores %s",
    (url) => {
      expect(shouldIgnoreRequestLog(requestWithUrl(url))).toBe(true);
    },
  );

  it.each(["/api/v1/agents", "/api/v1/healthy", "/health"]) (
    "keeps %s in request logs",
    (url) => {
      expect(shouldIgnoreRequestLog(requestWithUrl(url))).toBe(false);
    },
  );
});
