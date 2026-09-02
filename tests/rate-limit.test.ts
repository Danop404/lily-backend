import { describe, it, expect } from "vitest";

import { rateLimitHandler } from "../src/config/rate-limit";
import type { Request, Response } from "express";

interface MockResult {
  res: Response;
  statusCode: number | null;
  body: Record<string, unknown> | null;
  retryAfter: string | null;
}

function createMockResponse(opts: {
  resetTime: Date | null;
}): MockResult {
  const result: MockResult = {
    res: {} as Response,
    statusCode: null,
    body: null,
    retryAfter: null,
  };

  const res = {
    locals: {
      rateLimit: {
        resetTime: opts.resetTime,
      },
    },
    setHeader: (name: string, value: string) => {
      if (name === "Retry-After") result.retryAfter = value;
    },
    status: (code: number) => {
      result.statusCode = code;
      return {
        json: (b: Record<string, unknown>) => {
          result.body = b;
        },
      };
    },
  };

  result.res = res as unknown as Response;
  return result;
}

describe("Rate limiter error envelope (issue #79)", () => {
  it("returns the standard ApiErrorResponse shape on 429", () => {
    const mock = createMockResponse({
      resetTime: new Date(Date.now() + 60_000),
    });

    rateLimitHandler({} as Request, mock.res);

    expect(mock.statusCode).toBe(429);
    expect(mock.body).not.toBeNull();
    expect(mock.body!.success).toBe(false);
    expect(typeof mock.body!.message).toBe("string");
    expect((mock.body!.message as string).length).toBeGreaterThan(0);
  });

  it("sets Retry-After header when resetTime is in the future", () => {
    const mock = createMockResponse({
      resetTime: new Date(Date.now() + 30_000),
    });

    rateLimitHandler({} as Request, mock.res);

    expect(mock.retryAfter).not.toBeNull();
    expect(Number(mock.retryAfter)).toBeGreaterThan(0);
  });

  it("includes details with resetTime in the response body", () => {
    const resetTime = new Date(Date.now() + 5_000);
    const mock = createMockResponse({ resetTime });

    rateLimitHandler({} as Request, mock.res);

    expect(mock.body).not.toBeNull();
    expect(mock.body!.success).toBe(false);
    expect(mock.body!.details).toBeDefined();
    expect((mock.body!.details as Record<string, unknown>).resetTime).toBe(
      resetTime.toISOString(),
    );
  });

  it("omits Retry-After when resetTime is null", () => {
    const mock = createMockResponse({
      resetTime: null,
    });

    rateLimitHandler({} as Request, mock.res);

    expect(mock.retryAfter).toBeNull();
    expect(mock.statusCode).toBe(429);
    expect(mock.body).not.toBeNull();
    expect(mock.body!.success).toBe(false);
    expect((mock.body!.details as Record<string, unknown>).resetTime).toBeNull();
  });
});
