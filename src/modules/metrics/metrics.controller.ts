import type { Request, Response } from "express";

import type { ApiSuccessResponse } from "../../common/types/api-response";
import { metricsService } from "./metrics.service";
import type { ProcessMetrics } from "./metrics.types";

export const getMetrics = (
  _request: Request,
  response: Response<ApiSuccessResponse<ProcessMetrics>>,
): void => {
  response.status(200).json({
    success: true,
    data: metricsService.getMetrics(),
  });
};
