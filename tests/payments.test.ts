import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import {
  assetCodeSchema,
  amountSchema,
  stellarAddressSchema,
} from "../src/modules/payments/payments.schema";

const validQuotePayload = {
  fromWalletId: "wallet_123",
  toAddress: "GAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSABOV",
  amount: "100.5000000",
  assetCode: "USDC",
};

describe("payments quote endpoint", () => {
  const app = createApp();

  it("returns a quote for a valid Stellar payment request", async () => {
    const response = await request(app)
      .post("/api/v1/payments/quote")
      .send(validQuotePayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.quote).toMatchObject({
      amountOut: "100.5",
      fee: "0.1005",
    });
    expect(response.body.data.quote.quoteId).toEqual(expect.any(String));
    expect(Date.parse(response.body.data.quote.expiresAt)).not.toBeNaN();
  });

  it("rejects malformed quote payloads with field errors", async () => {
    const response = await request(app).post("/api/v1/payments/quote").send({
      fromWalletId: "",
      toAddress: "foo",
      amount: "abc",
      assetCode: "USD-coin",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Request validation failed");
    expect(response.body.details.fieldErrors).toMatchObject({
      fromWalletId: expect.any(Array),
      toAddress: expect.any(Array),
      amount: expect.any(Array),
      assetCode: expect.any(Array),
    });
  });
});

describe("payment quote validation", () => {
  it("accepts 1-12 character alphanumeric asset codes, including XLM", () => {
    expect(assetCodeSchema.safeParse("USDC").success).toBe(true);
    expect(assetCodeSchema.safeParse("XLM").success).toBe(true);
    expect(assetCodeSchema.safeParse("A1B2C3D4E5F6").success).toBe(true);
  });

  it("rejects invalid Stellar asset codes", () => {
    expect(assetCodeSchema.safeParse("US DC").success).toBe(false);
    expect(assetCodeSchema.safeParse("USD-coin").success).toBe(false);
    expect(assetCodeSchema.safeParse("TOO_LONG_CODE").success).toBe(false);
  });

  it("bounds amount digit length and rejects zero values", () => {
    expect(amountSchema.safeParse("9".repeat(24)).success).toBe(true);
    expect(amountSchema.safeParse(`${"9".repeat(24)}.1234567`).success).toBe(
      true,
    );
    expect(amountSchema.safeParse("9".repeat(25)).success).toBe(false);
    expect(amountSchema.safeParse("1.12345678").success).toBe(false);
    expect(amountSchema.safeParse("0").success).toBe(false);
    expect(amountSchema.safeParse("0.0000000").success).toBe(false);
  });

  it("validates Stellar public-key checksum", () => {
    expect(
      stellarAddressSchema.safeParse(validQuotePayload.toAddress).success,
    ).toBe(true);

    const badChecksum = `${validQuotePayload.toAddress.slice(0, -1)}A`;

    expect(stellarAddressSchema.safeParse("M".repeat(56)).success).toBe(false);
    expect(stellarAddressSchema.safeParse("GSHORT").success).toBe(false);
    expect(stellarAddressSchema.safeParse(badChecksum).success).toBe(false);
  });
});
