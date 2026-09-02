import { z } from "zod";

export const capabilityEnum = z.enum([
  "wallet-provisioning",
  "usdc-payments",
  "settlement",
  "payments",
]);

export type Capability = z.infer<typeof capabilityEnum>;

export const createAgentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(280),
  capabilities: z
    .array(capabilityEnum)
    .min(1)
    .max(10)
    .transform((caps) => [...new Set(caps)]),
});

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;

export const agentStatusSchema = z.object({
  status: z.enum(["active", "paused"]),
});

export type AgentStatusSchema = z.infer<typeof agentStatusSchema>;
