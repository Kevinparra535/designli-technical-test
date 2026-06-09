// src/middleware/auth.ts
//
// Shared auth types + the `optionalAuth` middleware. Token verification for
// *protected* routes is handled by Passport's JWT strategy (see
// modules/auth/passport.ts); `optionalAuth` stays for /devices and /webhooks,
// which accept anonymous calls but bind to a user when a Bearer token is present.

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';

/** The authenticated user as seen on `req.user` across the app. */
export interface AuthUser {
  id: string;
  email: string;
}

/** Shape of the signed/verified JWT payload (`sub` = user id). */
export interface JwtPayload {
  sub: string;
  email: string;
}

// Make Passport's `Express.User` (and therefore `req.user`) our AuthUser.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends AuthUser {}
  }
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

/** Decode a Bearer token if present; never rejects (anonymous = no req.user). */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      if (typeof decoded !== 'string') {
        req.user = { id: String(decoded.sub), email: String(decoded.email) };
      }
    } catch {
      // Ignore — treat as anonymous.
    }
  }
  next();
}
