// src/modules/auth/strategies/local.strategy.ts
//
// Passport LocalStrategy for POST /auth/login. Reads email + password from the
// request body and delegates credential checking to the auth service. On bad
// credentials the service throws a Boom 401, which we hand to `done(err, false)`
// so the central error handler renders it.

import { Strategy as LocalStrategy } from 'passport-local';

import * as service from '../auth.service';

export const localStrategy = new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await service.validateUser(email, password);
      done(null, user);
    } catch (err) {
      done(err as Error, false);
    }
  },
);
