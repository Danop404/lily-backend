import { env } from "@/config/env";

export const healthService = {
  getStatus: () => ({
    status: "ok",
    service: env.APP_NAME,
    environment: env.NODE_ENV,
    ...buildInfo,
    timestamp: new Date().toISOString(),
  }),
};
