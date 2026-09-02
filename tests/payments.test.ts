import { describe, expect, it } from "vitest";

import { normalizeAmount, quoteSchema } from "../src/modules/payments/payments.schema";

describe("normalizeAmount", () => {
  it("strips leading zeros from integer part", () => {
    expect(normalizeAmount("007.00")).toBe("7.00");
  });

  it("preserves valid amounts without leading zeros", () => {
    expect(normalizeAmount("100.00")).toBe("100.00");
  });

  it("keeps single zero before decimal for sub-unit amounts", () => {
    expect(normalizeAmount("0.50")).toBe("0.50");
  });

  it("normalizes multiple leading zeros", () => {
    expect(normalizeAmount("0000123.45")).toBe("123.45");
  });

  it("handles integer-only amounts", () => {
    expect(normalizeAmount("007")).toBe("7");
  });

  it("trims whitespace", () => {
    expect(normalizeAmount("  007.00  ")).toBe("7.00");
  });
});

describe("quoteSchema", () => {
  it("normalizes amount on parse", () => {
    const result = quoteSchema.parse({ amount: "007.00" });
    expect(result.amount).toBe("7.00");
  });

  it("applies default currency when omitted", () => {
    const result = quoteSchema.parse({ amount: "10.00" });
    expect(result.currency).toBe("USD");
  });

  it("rejects empty amount", () => {
    expect(() => quoteSchema.parse({ amount: "" })).toThrow();
  });
});
