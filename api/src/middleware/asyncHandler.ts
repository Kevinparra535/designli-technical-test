// src/middleware/asyncHandler.ts
//
// Wraps an async route handler so rejected promises are forwarded to Express'
// error middleware instead of crashing the process.

import type { NextFunction, Request, Response } from 'express';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
