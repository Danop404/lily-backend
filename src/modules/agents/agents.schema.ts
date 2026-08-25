import { z } from "zod";

export const createAgentSchema = z
  .object({
    name: z.string().min(2).max(80),
    description: z.string().min(10).max(280),
    capabilities: z.array(z.string().min(2).max(50)).min(1).max(10),
  })
  .strict();

export type CreateAgentSchema = z.infer<typeof createAgentSchema>;
