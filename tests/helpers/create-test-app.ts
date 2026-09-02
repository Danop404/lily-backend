import type { Express } from "express";
import { vi } from "vitest";

export const createIsolatedTestApp = async (): Promise<Express> => {
  vi.resetModules();
  const { createApp } = await import("../../src/app");
  return createApp();
};
