// src/middleware/errorHandler.ts
//
// Central error handler. Translates HttpError and Zod validation errors into
// clean JSON; everything else becomes a 500 (details hidden in production).

import Boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { isProd } from '../config/env';
import { HttpError } from '../lib/httpError';

export function notFoundHandler(_req: Request, res: Response) {
  const boom = Boom.notFound('Not found');
  res.status(boom.output.statusCode).json(boom.output.payload);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
   
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues,
    });
    return;
  }

  if (Boom.isBoom(err) || err instanceof HttpError) {
    const statusCode = Boom.isBoom(err) ? err.output.statusCode : err.status;
    const message = Boom.isBoom(err) ? err.output.payload.message : err.message;

    res.status(statusCode).json({
      error: message,
      ...(Boom.isBoom(err) && 'data' in err ? { details: err.data } : {}),
      ...(err instanceof HttpError && err.details ? { details: err.details } : {}),
    });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(isProd ? {} : { detail: String(err) }),
  });
}
