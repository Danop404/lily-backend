import type { Request, Response } from "express";

import type { ApiSuccessResponse } from "../../common/types/api-response";
import { paymentsService } from "./payments.service";
import type { QuoteRequest, QuoteResponse } from "./payments.types";

export const getQuote = (
  request: Request<
    Record<string, never>,
    ApiSuccessResponse<QuoteResponse>,
    QuoteRequest
  >,
  response: Response<ApiSuccessResponse<QuoteResponse>>,
): void => {
  response.status(201).json({
    success: true,
    data: paymentsService.getQuote(request.body),
  });
};
