// src/modules/auth/auth.routes.ts

import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';

import * as service from './auth.service';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);
    const result = await service.register(email, password);
    res.status(201).json(result);
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);
    const result = await service.login(email, password);
    res.json(result);
  }),
);

// Returns the current user from the Bearer token — handy for the app to verify
// a stored session is still valid.
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user!.sub, email: req.user!.email } });
});
