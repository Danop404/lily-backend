import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { errorHandler } from "./common/http/error.middleware";
import { notFoundHandler } from "./common/http/not-found.middleware";
import { corsOptions } from "./config/cors";
import { env, securityConfig } from "./config/env";
import { logger } from "./config/logger";
import { apiRateLimiter } from "./config/rate-limit";
import { apiRouter } from "./routes";

const noStoreApiCache: express.RequestHandler = (_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
};

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", securityConfig.trustProxy);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json({ limit: securityConfig.bodySizeLimit }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    pinoHttp({
      logger,
      customLogLevel(_request, response, error) {
        if (error || response.statusCode >= 500) {
          return "error";
        }

        if (response.statusCode >= 400) {
          return "warn";
        }

        return "info";
      },
    }),
  );
  app.use(apiRateLimiter);

  app.get("/", (_request, response) => {
    response.status(200).json({
      success: true,
      message: `${env.APP_NAME} is running`,
      docs: `${env.API_PREFIX}/health`,
    });
  });

  app.use(env.API_PREFIX, noStoreApiCache, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
