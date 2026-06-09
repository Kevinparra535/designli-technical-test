// src/modules/auth/auth.routes.ts
//
// Auth via Passport (LocalStrategy + JwtStrategy), as in the Notion guide.
//   POST /auth/register  — create user (bcrypt) → { token, user }
//   POST /auth/login     — LocalStrategy verifies creds → { token, user }
//   GET  /auth/me        — JwtStrategy protects the route → { user }

import { Router } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../../middleware/asyncHandler';
import { validatorHandler } from '../../middleware/validatorHandler';

import * as service from './auth.service';
import { authenticateJwt, authenticateLocal } from './passport';

const credentialsSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
  }),
});

export const authRouter = Router();

authRouter.post(
  '/register',
  validatorHandler(credentialsSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await service.register(email, password);
    res.status(201).json(result);
  }),
);

authRouter.post(
  '/login',
  validatorHandler(credentialsSchema, 'body'),
  authenticateLocal,
  (req, res) => {
    // LocalStrategy populated req.user (AuthUser) on success.
    const user = req.user!;
    res.json({ token: service.signToken(user), user });
  },
);

// Protected: returns the current user from the Bearer token.
authRouter.get('/me', authenticateJwt, (req, res) => {
  res.json({ user: req.user });
});
