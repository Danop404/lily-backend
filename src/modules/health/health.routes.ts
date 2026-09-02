import { Router } from "express";
import { methodNotAllowedHandler } from "../../common/http/method-not-allowed.middleware";

import { getHealthStatus, getLivenessStatus, getReadinessStatus } from "./health.controller";

export const healthRouter = Router();

healthRouter.get("/", getHealthStatus);
healthRouter.get("/live", getLivenessStatus);
healthRouter.get("/ready", getReadinessStatus);
