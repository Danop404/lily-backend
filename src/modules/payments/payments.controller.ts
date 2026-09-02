import type { Request, Response } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { paymentsService } from "./payments.service";
import type {
  CreateQuoteInput,
  ExecutePaymentInput,
} from "./payments.types";

export const createQuote = asyncHandler(
  async (request: Request, response: Response) => {
    const input: CreateQuoteInput = {
      sourceAsset: request.body.sourceAsset,
      destinationAsset: request.body.destinationAsset,
      sourceAmount: request.body.sourceAmount,
    };

    const result = paymentsService.createQuote(input);

    response.status(201).json({ success: true, data: result });
  },
);

export const getQuote = asyncHandler(
  async (request: Request, response: Response) => {
    const id = request.params.id as string;
    const result = paymentsService.getQuoteById(id);

    response.status(200).json({ success: true, data: result });
  },
);

export const executePayment = asyncHandler(
  async (request: Request, response: Response) => {
    const input: ExecutePaymentInput = {
      quoteId: request.body.quoteId,
      confirmed: request.body.confirmed,
    };

    const result = paymentsService.executePayment(input);

    response.status(200).json({ success: true, data: result });
  },
);
