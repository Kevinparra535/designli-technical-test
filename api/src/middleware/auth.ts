// src/middleware/auth.ts
//
// Shared auth types used across the app. Token verification for protected routes
// is handled by Passport's JWT strategy (see modules/auth/passport.ts →
// `authenticateJwt`). Every /devices and /webhooks route now requires auth, so
// `req.user` is always present there.

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
