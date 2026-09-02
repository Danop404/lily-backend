import { createServer } from "node:http";

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { buildInfo } from "./config/build-info";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
      ...buildInfo,
    },
    "Lily backend server started",
  );
});

let isShuttingDown = false;

const shutdown = (signal: string) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  logger.info({ signal }, "Graceful shutdown started");

  // Force close after 10s if connections fail to drain
  const forceTimeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out, forcing process exit");
    process.exit(1);
  }, 10_000);
  forceTimeout.unref();

  // Close idle connections to speed up draining
  if (typeof server.closeIdleConnections === "function") {
    server.closeIdleConnections();
  }

  server.close((error) => {
    clearTimeout(forceTimeout);
    if (error) {
      logger.error({ err: error }, "Error while shutting down server");
      process.exit(1);
    }

    logger.info("HTTP server closed");
    process.exit(0);
  });
};

const normalizeError = (reason: unknown): Error =>
  reason instanceof Error ? reason : new Error(String(reason));

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal({ err: reason }, "Unhandled Promise Rejection detected");
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error: Error) => {
  logger.fatal({ err: error }, "Uncaught Exception detected");
  shutdown("uncaughtException");
});
