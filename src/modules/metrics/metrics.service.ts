import { env } from "../../config/env";
import type { ProcessMetrics } from "./metrics.types";

export const metricsService = {
  getMetrics: (): ProcessMetrics => {
    const memory = process.memoryUsage();
    return {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsage: {
        rssBytes: memory.rss,
        heapTotalBytes: memory.heapTotal,
        heapUsedBytes: memory.heapUsed,
        externalBytes: memory.external,
      },
      nodeVersion: process.version,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  },
};
