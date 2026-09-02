import { Router } from "express";

import { getHealthStatus, getLivenessStatus, getReadinessStatus } from "./health.controller";

export const healthRouter = Router();

healthRouter.get("/", getHealthStatus);
healthRouter.get("/live", getLivenessStatus);
healthRouter.get("/ready", getReadinessStatus);
