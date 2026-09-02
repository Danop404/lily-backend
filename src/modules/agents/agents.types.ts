export type AgentStatus = "active" | "paused";

export interface Agent {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  status: AgentStatus;
  capabilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentInput {
  name: string;
  description: string;
  capabilities: string[];
}

export interface ListAgentsResponse {
  agents: Agent[];
  total: number;
}

export interface CreateAgentResponse {
  agent: Agent;
}

export interface UpdateAgentStatusResponse {
  agent: Agent;
}
