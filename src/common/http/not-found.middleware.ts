import type { NextFunction, Request, Response, Router } from "express";

import { AppError } from "@/common/http/app-error";

/**
 * Collects all defined route paths from an Express 5 router stack.
 * Since Express 5 does not reliably expose mount paths on middleware layers,
 * this function collects leaf route paths relative to their immediate router.
 * For 405 detection, we use these at the sub-router level where paths are known.
 */
const collectSubRouterPaths = (stack: any[]): Set<string> => {
  const paths = new Set<string>();
  for (const layer of stack) {
    if (layer.route) {
      const p = (layer.route.path || "").replace(/\/+$/, "") || "/";
      paths.add(p);
    }
  }
  return paths;
};

/**
 * Attaches a trailing wildcard handler to each sub-router that checks whether
 * the requested path matches any defined route in that sub-router. If it does
 * but the method is not allowed, emits a 405. Otherwise passes through to
 * the parent router's notFoundHandler.
 *
 * Uses Express 5 compatible "{*path}" wildcard syntax instead of "*".
 */
export const attachMethodNotAllowedHandlers = (router: any): void => {
  if (!router?.stack) return;

  for (const layer of router.stack) {
    if (layer.name === "router" && layer.handle?.stack) {
      const subRouter = layer.handle as Router & { _has405Handler?: boolean };

      if (!subRouter._has405Handler) {
        const knownPaths = collectSubRouterPaths(subRouter.stack);

        // Express 5 uses path-to-regexp v8+ which requires named wildcards
        subRouter.all("/{*path}", (req: Request, _res: Response, next: NextFunction) => {
          const reqPath = req.path.replace(/\/+$/, "") || "/";
          if (knownPaths.has(reqPath)) {
            next(new AppError(405, `Method ${req.method} not allowed for ${req.originalUrl}`));
          } else {
            next();
          }
        });
        subRouter._has405Handler = true;
      }

      // Recurse into deeply nested routers
      attachMethodNotAllowedHandlers(subRouter);
    }
  }
};

/**
 * Middleware factory that attaches 405 handlers to sub-routers and returns
 * a top-level fallback for root-level routes.
 */
export const methodNotAllowedHandler = (router: any) => {
  attachMethodNotAllowedHandlers(router);

  return (request: Request, _response: Response, next: NextFunction): void => {
    const topRoutes = (router.stack || []).filter((l: any) => l.route);
    const reqPath = request.path.replace(/\/+$/, "") || "/";
    const method = request.method.toUpperCase();

    const matched = topRoutes.some((l: any) => {
      const rp = (l.route.path || "").replace(/\/+$/, "") || "/";
      return rp === reqPath && !Object.keys(l.route.methods).map((m: string) => m.toUpperCase()).includes(method);
    });

    if (matched) {
      next(new AppError(405, `Method ${method} not allowed for ${request.originalUrl}`));
      return;
    }

    next();
  };
};

export const notFoundHandler = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      404,
      `Route not found: ${request.method} ${request.originalUrl}`,
      undefined,
      "NOT_FOUND",
    ),
  );
};
