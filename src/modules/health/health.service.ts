import { env } from "@/config/env";

export const healthService = {
  getStatus: () => ({
    status: "ok" as const,
    service: env.APP_NAME,
    environment: env.NODE_ENV,
    ...buildInfo,
    timestamp: new Date().toISOString(),
  }),

  getLiveness: () => ({
    status: "ok" as const,
    service: env.APP_NAME,
    timestamp: new Date().toISOString(),
  }),

  getReadiness: () => ({
    status: "ok" as const,
    service: env.APP_NAME,
    environment: env.NODE_ENV,
    checks: {
      dependencies: "ok" as const,
    },
    timestamp: new Date().toISOString(),
  }),
};
