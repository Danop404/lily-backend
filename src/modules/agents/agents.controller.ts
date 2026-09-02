import type { Request, Response } from "express";

import type { ApiSuccessResponse } from "../../common/types/api-response";
import type { CreateAgentResponse, ListAgentsResponse, UpdateAgentStatusResponse } from "./agents.types";
import { agentsService } from "./agents.service";
import type { CreateAgentSchema, UpdateAgentSchema } from "./agents.schema";

export const listAgents = (
  _request: Request,
  response: Response<ApiSuccessResponse<ReturnType<typeof agentsService.listAgents>>>,
): void => {
  response.status(200).json({
    success: true,
    data: agentsService.listAgents(),
  });
};

export const createAgent = (
  request: Request<Record<string, never>, unknown, CreateAgentInput>,
  response: Response<ApiSuccessResponse<CreateAgentResponse>>,
): void => {
  const agent = agentsService.createAgent(request.body);

  response.status(201).json({
    success: true,
    data: {
      agent,
    },
  });
};

export const updateAgentStatus = (
  request: Request<{ id: string }>,
  response: Response<ApiSuccessResponse<UpdateAgentStatusResponse>>,
): void => {
  const { id } = request.params;
  const { status } = request.body;

  const result = agentsService.updateAgentStatus(id, status);

  response.status(200).json({
    success: true,
    data: result,
  });
};

export const createAgent = (
  request: Request<object, unknown, CreateAgentSchema>,
  response: Response<ApiSuccessResponse<ReturnType<typeof agentsService.createAgent>>>,
): void => {
  const agent = agentsService.createAgent(request.body);
  response.status(201).json({
    success: true,
    data: agent,
  });
};

export const updateAgent = (
  request: Request<{ id: string }, unknown, UpdateAgentSchema>,
  response: Response,
): void => {
  const updated = agentsService.updateAgent(request.params.id, request.body);
  if (!updated) {
    throw new AppError(404, `Agent not found: ${request.params.id}`);
  }
  response.status(200).json({
    success: true,
    data: { agent: updated },
  });
};

export const deleteAgent = (
  request: Request<{ id: string }>,
  response: Response,
): void => {
  const deleted = agentsService.deleteAgent(request.params.id);
  if (!deleted) {
    throw new AppError(404, `Agent not found: ${request.params.id}`);
  }
  response.status(204).send();
};
