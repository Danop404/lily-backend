import { z } from "zod";

import { isValidStellarAddress } from "./stellar-address";

const MAX_INTEGER_DIGITS = 24;
const MAX_FRACTIONAL_DIGITS = 7;

export const assetCodeSchema = z
  .string()
  .min(1, "assetCode is required")
  .max(12, "assetCode must be at most 12 characters")
  .regex(/^[A-Za-z0-9]+$/, "assetCode must contain only letters and numbers");

export const amountSchema = z
  .string()
  .regex(
    new RegExp(
      `^\\d{1,${MAX_INTEGER_DIGITS}}(\\.\\d{1,${MAX_FRACTIONAL_DIGITS}})?$`,
    ),
    `Amount must have at most ${MAX_INTEGER_DIGITS} integer digits and ${MAX_FRACTIONAL_DIGITS} fractional digits`,
  )
  .refine((value) => /[1-9]/.test(value.replace(".", "")), {
    message: "Amount must be greater than zero",
  });

export const stellarAddressSchema = z
  .string()
  .refine(isValidStellarAddress, "toAddress must be a valid Stellar G-address");

export const quoteRequestSchema = z.object({
  fromWalletId: z.string().min(1, "fromWalletId is required"),
  toAddress: stellarAddressSchema,
  amount: amountSchema,
  assetCode: assetCodeSchema.describe(
    "Stellar asset code; use XLM for the native Stellar asset.",
  ),
});

export type QuoteRequestSchema = z.infer<typeof quoteRequestSchema>;
