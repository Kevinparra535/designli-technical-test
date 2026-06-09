// src/modules/auth/strategies/jwt.strategy.ts
//
// Passport JwtStrategy for protected routes. Extracts the Bearer token, verifies
// it with JWT_SECRET, and maps the payload (`sub` = user id) onto req.user.

import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import { env } from '../../../config/env';
import type { AuthUser, JwtPayload } from '../../../middleware/auth';

export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_SECRET,
  },
  (payload: JwtPayload, done) => {
    const user: AuthUser = {
      id: String(payload.sub),
      email: String(payload.email),
    };
    done(null, user);
  },
);
