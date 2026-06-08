// src/lib/httpError.ts
//
// Typed error carrying an HTTP status. Thrown anywhere in a handler and turned
// into a JSON response by the central error handler.

import Boom from '@hapi/boom';

export class HttpError extends Error {
  public readonly status: number;
  public readonly details?: unknown;
  public readonly isBoom: boolean;
  public readonly output: Boom.Output;

  constructor(status: number, message: string, details?: unknown) {
    const boomError = Boom.boomify(new Error(message), {
      statusCode: status,
      data: details,
    });

    super(boomError.message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
    this.isBoom = true;
    this.output = boomError.output;

    Object.assign(this, boomError);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new HttpError(401, message);
  }

  static notFound(message = 'Not found') {
    return new HttpError(404, message);
  }

  static conflict(message: string) {
    return new HttpError(409, message);
  }
}
