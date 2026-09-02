import { describe, it, expect } from "vitest";
import { stellarAssetCodeSchema, quoteSchema } from "../src/modules/payments/payments.schema";

describe("stellarAssetCodeSchema", () => {
  it("accepts valid 1-12 alphanumeric codes", () => {
    expect(stellarAssetCodeSchema.safeParse("USDC").success).toBe(true);
  });

  it("accepts single character code", () => {
    expect(stellarAssetCodeSchema.safeParse("A").success).toBe(true);
  });

  it("accepts 12-character code (max length)", () => {
    expect(stellarAssetCodeSchema.safeParse("ABCDEFGHIJKL").success).toBe(true);
  });

  it("accepts mixed case alphanumeric", () => {
    expect(stellarAssetCodeSchema.safeParse("AbCd1234").success).toBe(true);
  });

  it("accepts XLM (native asset special case)", () => {
    expect(stellarAssetCodeSchema.safeParse("XLM").success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = stellarAssetCodeSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects code longer than 12 characters", () => {
    const result = stellarAssetCodeSchema.safeParse("ABCDEFGHIJKLM");
    expect(result.success).toBe(false);
  });

  it("rejects spaces in asset code", () => {
    const result = stellarAssetCodeSchema.safeParse("US DC");
    expect(result.success).toBe(false);
  });

  it("rejects hyphens in asset code", () => {
    const result = stellarAssetCodeSchema.safeParse("USD-CDC");
    expect(result.success).toBe(false);
  });

  it("rejects unicode/emoji in asset code", () => {
    const result = stellarAssetCodeSchema.safeParse("USD\u{1F600}");
    expect(result.success).toBe(false);
  });

  it("rejects special characters", () => {
    const result = stellarAssetCodeSchema.safeParse("US$DC");
    expect(result.success).toBe(false);
  });

  it("rejects underscores", () => {
    const result = stellarAssetCodeSchema.safeParse("US_DC");
    expect(result.success).toBe(false);
  });
});

describe("quoteSchema", () => {
  it("accepts a valid quote request with XLM", () => {
    const result = quoteSchema.safeParse({
      assetCode: "XLM",
      amount: "100.50",
      destination: "GABC123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid quote request with USDC", () => {
    const result = quoteSchema.safeParse({
      assetCode: "USDC",
      amount: "50",
      destination: "GXYZ789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects quote with invalid asset code containing space", () => {
    const result = quoteSchema.safeParse({
      assetCode: "US DC",
      amount: "50",
      destination: "GXYZ789",
    });
    expect(result.success).toBe(false);
  });

  it("rejects quote with missing amount", () => {
    const result = quoteSchema.safeParse({
      assetCode: "USDC",
      destination: "GXYZ789",
    });
    expect(result.success).toBe(false);
  });

  it("rejects quote with missing destination", () => {
    const result = quoteSchema.safeParse({
      assetCode: "USDC",
      amount: "50",
    });
    expect(result.success).toBe(false);
  });

  it("rejects quote with empty asset code", () => {
    const result = quoteSchema.safeParse({
      assetCode: "",
      amount: "50",
      destination: "GXYZ789",
    });
    expect(result.success).toBe(false);
  });

  it("rejects quote with emoji in asset code", () => {
    const result = quoteSchema.safeParse({
      assetCode: "USD\u{1F600}",
      amount: "50",
      destination: "GXYZ789",
    });
    expect(result.success).toBe(false);
  });
});
