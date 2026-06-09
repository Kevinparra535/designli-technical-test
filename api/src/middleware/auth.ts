// src/middleware/auth.ts
//
// JWT auth middleware. `requireAuth` rejects requests without a valid Bearer
// token. `optionalAuth` decodes the token when present but never rejects — used
// on /devices and /webhooks so the existing app (which does not yet send a
// token) keeps working, while authenticated calls get their user_id attached.

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { HttpError } from '../lib/httpError';

export interface AuthPayload {
  sub: string; // user id
  email: string;
}

// Augment Express' Request with the decoded user.
declare global {
   
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function verify(token: string): AuthPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string') throw new Error('Unexpected token payload');
  return { sub: String(decoded.sub), email: String(decoded.email) };
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return next(HttpError.unauthorized('Missing Bearer token'));
  try {
    req.user = verify(token);
    next();
  } catch {
    next(HttpError.unauthorized('Invalid or expired token'));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = verify(token);
    } catch {
      // Ignore — treat as anonymous.
    }
  }
  next();
}
