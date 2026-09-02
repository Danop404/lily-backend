import type { Request, Response } from "express";

export const methodNotAllowedHandler = (
  _request: Request,
  response: Response,
): void => {
  response.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};
