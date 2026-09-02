import { AppError } from "../../common/http/app-error";
import type {
  Agent,
  CreateAgentInput,
  CreateAgentResponse,
  ListAgentsResponse,
  UpdateAgentStatusResponse,
} from "./agents.types";

const MAX_IN_MEMORY_AGENTS = 5_000;

const initialAgents: Agent[] = [
  {
    id: "agentlily_demo_001",
    name: "Treasury Settlement Agent",
    description:
      "AgentLily instance responsible for orchestrating treasury rebalancing operations.",
    walletAddress: "GBVDO6P6E3S6XG2Z5V5L7N3Z6Y2K4J5H7F8D9S0A1B2C3D4E5F6G7H8I",
    status: "active",
    capabilities: ["settlement", "rebalance", "liquidity-monitoring"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

let agents: Agent[] = [...initialAgents];
let agentSequence = initialAgents.length + 1;

export const agentsService = {
  listAgents: () => ({
    total: agents.length,
    agents: [...agents],
  }),

  getAgentById: (id: string): Agent | undefined => {
    return agents.find((agent) => agent.id === id);
  },

  createAgent: (input: CreateAgentInput): Agent => {
    const now = new Date().toISOString();
    const slug = input.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const walletAddress = `G${slug.padEnd(55, "0").slice(0, 55)}`;

    const agent: Agent = {
      id: `agentlily_${agentSequence++}`,
      name: input.name,
      description: input.description,
      walletAddress,
      status: "active",
      capabilities: input.capabilities,
      createdAt: now,
      updatedAt: now,
    };

    if (agents.length >= MAX_IN_MEMORY_AGENTS) {
      agents.shift();
    }

    agents.push(agent);
    return agent;
  },

  updateAgentStatus(id: string, status: Agent["status"]): UpdateAgentStatusResponse {
    const agent = agentsStore.find((a) => a.id === id);

    if (!agent) {
      throw new AppError(404, "Agent not found");
    }

    agent.status = status;

    return { agent };
  },
};
