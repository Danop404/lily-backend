import { randomUUID } from "node:crypto";

import type { QuoteRequest, QuoteResponse } from "./payments.types";

const QUOTE_TTL_MS = 5 * 60 * 1000;

const normalizeDecimal = (value: string): string => {
  const [integerPart = "0", fractionalPart = ""] = value.split(".");
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "");
  const normalizedFraction = fractionalPart.replace(/0+$/, "");

  return normalizedFraction
    ? `${normalizedInteger}.${normalizedFraction}`
    : normalizedInteger;
};

export const applyStubFee = (amount: string): string => {
  const [integerPart = "0", fractionalPart = ""] = amount.split(".");
  const fractionalUnits = fractionalPart.padEnd(7, "0");
  const stroops = BigInt(integerPart + fractionalUnits);
  const fee = stroops / 1000n;

  if (fee === 0n) {
    return "0.0000001";
  }

  const feeString = fee.toString().padStart(8, "0");
  const integerFee = feeString.slice(0, -7).replace(/^0+(?=\d)/, "");
  const fractionalFee = feeString.slice(-7).replace(/0+$/, "");

  return fractionalFee ? `${integerFee}.${fractionalFee}` : integerFee;
};

export const paymentsService = {
  getQuote(input: QuoteRequest): QuoteResponse {
    return {
      quote: {
        quoteId: randomUUID(),
        fee: applyStubFee(input.amount),
        amountOut: normalizeDecimal(input.amount),
        expiresAt: new Date(Date.now() + QUOTE_TTL_MS).toISOString(),
      },
    };
  },
};
