// src/middleware/errorHandler.ts
//
// Error-handling middleware chain, following the Notion guide's structure:
//   app.use(logErrors)         -> log the error, pass it on
//   app.use(boomErrorHandler)  -> if it's a Boom error, render its payload
//   app.use(errorHandler)      -> fallback for anything non-Boom (500)
// Registered in this exact order in app.ts. HttpError is boomified, so it flows
// through boomErrorHandler; Joi failures arrive as Boom via validatorHandler.

import Boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';

import { isProd } from '../config/env';

/** 404 for unmatched routes (Boom payload shape). */
export function notFoundHandler(_req: Request, res: Response) {
  const boom = Boom.notFound('Not found');
  res.status(boom.output.statusCode).json(boom.output.payload);
}

/** 1) Log every error, then hand off to the next error middleware. */
export function logErrors(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  console.error('[error]', err);
  next(err);
}

/** 2) Render Boom errors (incl. our boomified HttpError) as JSON. */
export function boomErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (Boom.isBoom(err)) {
    const { output, data } = err;
    res.status(output.statusCode).json({
      ...output.payload,
      ...(data ? { details: data } : {}),
    });
    return;
  }
  next(err);
}

/** 3) Fallback for non-Boom errors. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
   
  _next: NextFunction,
) {
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({
    statusCode: 500,
    error: 'Internal Server Error',
    message: isProd ? 'Internal server error' : message,
  });
}
