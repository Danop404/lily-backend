import type { Request, Response, NextFunction } from "express";

export const cacheControlNoStore = (
  _request: Request,
  response: Response,
  next: NextFunction,
): void => {
  response.setHeader("Cache-Control", "no-store");
  next();
};
