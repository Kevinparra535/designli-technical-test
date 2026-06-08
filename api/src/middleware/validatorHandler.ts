// src/middleware/validatorHandler.ts
//
// Reusable validation middleware (the guide's pattern). Validates a request
// "property" (body/params/query) against a Joi schema; on failure it forwards a
// Boom badRequest so the boomErrorHandler turns it into a clean 400. On success
// it writes the coerced value (defaults applied) back onto the request.

import Boom from '@hapi/boom';
import type { NextFunction, Request, Response } from 'express';
import type { Schema } from 'joi';

type Property = 'body' | 'params' | 'query';

export function validatorHandler(schema: Schema, property: Property) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = req[property];
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      next(Boom.badRequest(error.message, error.details));
      return;
    }
    req[property] = value;
    next();
  };
}
