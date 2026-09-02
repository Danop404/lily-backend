import { AppError } from "../../common/http/app-error";
import type {
  CreateQuoteInput,
  CreateQuoteResponse,
  ExecutePaymentInput,
  ExecutePaymentResponse,
  GetQuoteResponse,
  PaymentRecord,
  Quote,
} from "./payments.types";

const QUOTE_TTL_MS = 5 * 60 * 1000;

const quotesStore = new Map<string, Quote>();
const paymentsStore: PaymentRecord[] = [];

const generateQuoteId = (): string => {
  return `quote_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const generatePaymentId = (): string => {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const computeDestinationAmount = (sourceAmount: string): string => {
  const amount = parseFloat(sourceAmount);
  if (Number.isNaN(amount)) return "0";
  const rate = "1.0002";
  const dest = amount * parseFloat(rate);
  return dest.toFixed(6);
};

const computeFee = (sourceAmount: string): string => {
  const amount = parseFloat(sourceAmount);
  if (Number.isNaN(amount)) return "0";
  const fee = amount * 0.001;
  return fee.toFixed(6);
};

const refreshExpiry = (quote: Quote): void => {
  if (Date.now() >= new Date(quote.expiresAt).getTime()) {
    quote.status = "expired";
  }
};

export const paymentsService = {
  createQuote(input: CreateQuoteInput): CreateQuoteResponse {
    const now = new Date();
    const quote: Quote = {
      id: generateQuoteId(),
      sourceAsset: input.sourceAsset,
      destinationAsset: input.destinationAsset,
      sourceAmount: input.sourceAmount,
      destinationAmount: computeDestinationAmount(input.sourceAmount),
      fee: computeFee(input.sourceAmount),
      rate: "1.0002",
      expiresAt: new Date(now.getTime() + QUOTE_TTL_MS).toISOString(),
      createdAt: now.toISOString(),
      status: "active",
    };

    quotesStore.set(quote.id, quote);

    return { quote };
  },

  getQuoteById(id: string): GetQuoteResponse {
    const quote = quotesStore.get(id);

    if (!quote) {
      throw new AppError(404, "Quote not found");
    }

    refreshExpiry(quote);

    if (quote.status === "expired") {
      throw new AppError(410, "Quote has expired");
    }

    return { quote };
  },

  executePayment(input: ExecutePaymentInput): ExecutePaymentResponse {
    const quote = quotesStore.get(input.quoteId);

    if (!quote) {
      throw new AppError(404, "Quote not found");
    }

    refreshExpiry(quote);

    if (quote.status === "expired") {
      throw new AppError(410, "Quote has expired");
    }

    if (quote.status === "executed") {
      throw new AppError(409, "Quote has already been executed");
    }

    if (!input.confirmed) {
      throw new AppError(400, "Payment must be confirmed");
    }

    const payment: PaymentRecord = {
      id: generatePaymentId(),
      quoteId: quote.id,
      sourceAsset: quote.sourceAsset,
      destinationAsset: quote.destinationAsset,
      sourceAmount: quote.sourceAmount,
      destinationAmount: quote.destinationAmount,
      fee: quote.fee,
      rate: quote.rate,
      status: "settled",
      createdAt: new Date().toISOString(),
    };

    paymentsStore.push(payment);
    quote.status = "executed";

    return { payment };
  },

  reset(): void {
    quotesStore.clear();
    paymentsStore.splice(0, paymentsStore.length);
  },
};
