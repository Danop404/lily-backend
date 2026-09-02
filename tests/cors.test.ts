import { describe, expect, it } from "vitest";

import { corsOptions } from "../src/config/cors";

describe("CORS options handler", () => {
  it("allows non-browser requests with no origin", () => {
    let resultError: Error | null = null;
    let resultAllowed: boolean | undefined;

    if (typeof corsOptions.origin === "function") {
      corsOptions.origin(undefined, (err, allow) => {
        resultError = err;
        resultAllowed = allow;
      });
    }

    expect(resultError).toBeNull();
    expect(resultAllowed).toBe(true);
  });

  it("allows configured whitelist origins", () => {
    let resultError: Error | null = null;
    let resultAllowed: boolean | undefined;

    if (typeof corsOptions.origin === "function") {
      corsOptions.origin("http://localhost:3000", (err, allow) => {
        resultError = err;
        resultAllowed = allow;
      });
    }

    expect(resultError).toBeNull();
    expect(resultAllowed).toBe(true);
  });

  it("rejects unauthorized origins", () => {
    let resultError: Error | null = null;

    if (typeof corsOptions.origin === "function") {
      corsOptions.origin("https://malicious-site.com", (err) => {
        resultError = err;
      });
    }

    expect(resultError).not.toBeNull();
    expect(resultError?.message).toBe("Origin not allowed by CORS");
  });
});
