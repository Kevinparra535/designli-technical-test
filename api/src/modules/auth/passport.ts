// src/modules/auth/passport.ts
//
// Registers the Passport strategies and exposes:
//  - `passport`        — call `passport.initialize()` once in app.ts
//  - `authenticateLocal` — middleware for POST /auth/login
//  - `authenticateJwt`   — middleware to protect routes (Boom-shaped 401)
//
// We use a custom callback for JWT so failures become a Boom 401 (consistent
// JSON) instead of Passport's default plain-text "Unauthorized".

import type { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { HttpError } from '../../lib/httpError';
import type { AuthUser } from '../../middleware/auth';
import { jwtStrategy } from './strategies/jwt.strategy';
import { localStrategy } from './strategies/local.strategy';

passport.use('local', localStrategy);
passport.use('jwt', jwtStrategy);

/** Login middleware — populates req.user from email/password (no session). */
export const authenticateLocal = passport.authenticate('local', {
  session: false,
});

/** Protect a route with the JWT strategy; rejects with a Boom 401. */
export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: unknown, user: AuthUser | false) => {
      if (err) return next(err);
      if (!user) return next(HttpError.unauthorized('Invalid or expired token'));
      req.user = user;
      next();
    },
  )(req, res, next);
}

export { passport };
