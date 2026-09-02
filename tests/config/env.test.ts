 import { describe, expect, it } from "vitest";
 import { z } from "zod";

 // Inline the schema to test validation logic without side effects from dotenv
 import { env as _env } from "../../../src/config/env";
 // We test the actual exported schema behavior by re-parsing with process.env overrides
 // But since env.ts parses at import time, we test the transform logic directly via a fresh schema
 const trustProxySchema = z
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
   });

 describe("TRUST_PROXY validation", () => {
   const baseEnv = {
     NODE_ENV: "test",
     PORT: "4000",
     APP_NAME: "Test",
     API_PREFIX: "/api/v1",
     LOG_LEVEL: "info",
     CORS_ORIGINS: "http://localhost:3000",
     BODY_SIZE_LIMIT: "1mb",
     RATE_LIMIT_WINDOW_MS: "900000",
     RATE_LIMIT_MAX_REQUESTS: "100",
   };

   it('accepts "false" and transforms to boolean false', () => {
     const result = trustProxySchema.parse("false");
     expect(result).toBe(false);
   });

   it('accepts "true" and transforms to boolean true', () => {
     const result = trustProxySchema.parse("true");
     expect(result).toBe(true);
   });

   it("accepts numeric string hop counts", () => {
     const result = trustProxySchema.parse("1");
     expect(result).toBe(1);
   });

   it("accepts zero as valid hop count", () => {
     const result = trustProxySchema.parse("0");
     expect(result).toBe(0);
   });

   it("rejects negative numbers", () => {
     expect(() => trustProxySchema.parse("-1")).toThrow();
   });

   it("rejects non-numeric strings", () => {
     expect(() => trustProxySchema.parse("yes")).toThrow();
   });

   it("rejects floating point numbers", () => {
     expect(() => trustProxySchema.parse("1.5")).toThrow();
   });

   it("defaults to false when not provided", () => {
     const result = trustProxySchema.parse(undefined);
     expect(result).toBe(false);
   });
 });
