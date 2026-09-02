import type { IncomingMessage } from "node:http";

const HEALTH_PATH = "/api/v1/health";

export const shouldIgnoreRequestLog = (request: IncomingMessage): boolean => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

  return (
    pathname === "/" ||
    pathname === HEALTH_PATH ||
    pathname.startsWith(`${HEALTH_PATH}/`)
  );
};
