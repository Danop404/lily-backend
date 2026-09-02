import { Router } from "express";
import { methodNotAllowedHandler } from "../../common/http/method-not-allowed.middleware";

import { validateBody } from "../../common/http/validate.middleware";
import { createAgent, listAgents, updateAgentStatus } from "./agents.controller";
import { createAgentSchema, agentStatusSchema } from "./agents.schema";

export const agentsRouter = Router();

agentsRouter.get("/", listAgents);
agentsRouter.get("/:id", getAgent);
agentsRouter.post("/", validateBody(createAgentSchema), createAgent);
agentsRouter.patch("/:id", validateBody(agentStatusSchema), updateAgentStatus);
