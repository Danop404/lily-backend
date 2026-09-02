import { Router } from "express";

import { agentsRouter } from "../modules/agents/agents.routes";
import { healthRouter } from "../modules/health/health.routes";

export const v1Router = Router();

v1Router.use("/health", healthRouter);
v1Router.use("/agents", agentsRouter);
