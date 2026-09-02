import { z } from "zod";

/**
 * Normalizes a decimal amount string by stripping leading zeros
 * while preserving the canonical decimal form.
 * "007.00" -> "7.00", "0.50" -> "0.50", "100.00" -> "100.00"
 */
export const normalizeAmount = (val: string): string => {
  const trimmed = val.trim();
  if (!trimmed) return trimmed;

  const parts = trimmed.split(".");
  // Strip leading zeros from integer part, but keep at least one digit
  const intPart = parts[0].replace(/^0+/, "") || "0";
  const decPart = parts.length > 1 ? "." + parts.slice(1).join(".") : "";
  return intPart + decPart;
};

export const quoteSchema = z.object({
  amount: z
    .string()
    .min(1)
    .transform(normalizeAmount),
  currency: z.string().min(3).max(3).default("USD"),
});

export type QuoteInput = z.input<typeof quoteSchema>;
export type QuoteOutput = z.output<typeof quoteSchema>;
