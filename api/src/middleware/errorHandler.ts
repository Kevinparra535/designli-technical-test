// src/middleware/errorHandler.ts
//
// Central error handler. Translates HttpError and Zod validation errors into
// clean JSON; everything else becomes a 500 (details hidden in production).

import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { isProd } from '../config/env';
import { HttpError } from '../lib/httpError';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.issues });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(isProd ? {} : { detail: String(err) }),
  });
}
