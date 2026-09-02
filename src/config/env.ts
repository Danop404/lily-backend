import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  APP_NAME: z.string().min(1).default("Lily Backend"),
  API_PREFIX: z.string().min(1).default("/api/v1"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGINS: z.string().min(1).default("http://localhost:3000"),
  BODY_SIZE_LIMIT: z.string().min(1).default("1mb"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  TRUST_PROXY: z
    .string()
    .default("false")
    .refine((val) => {
      if (val === "true" || val === "false") return true;
      const num = Number(val);
      return Number.isInteger(num) && num >= 0;
    }, {
      message: `TRUST_PROXY must be "true", "false", or a non-negative integer hop count`,
    })
    .transform((value) => {
      if (value === "false") return false as boolean | number;
      if (value === "true") return true as boolean | number;
      return Number(value) as boolean | number;
    }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment configuration: ${parsedEnv.error.flatten().formErrors.join(", ")}`,
  );
}

export const env = parsedEnv.data;

export const securityConfig = {
  allowedOrigins: env.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  bodySizeLimit: env.BODY_SIZE_LIMIT,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  trustProxy: env.TRUST_PROXY,
};
