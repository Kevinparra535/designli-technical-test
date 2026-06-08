// src/modules/auth/auth.routes.ts

import { Router } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validatorHandler } from '../../middleware/validatorHandler';

import * as service from './auth.service';

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
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await service.login(email, password);
    res.json(result);
  }),
);

// Returns the current user from the Bearer token — handy for the app to verify
// a stored session is still valid.
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user!.sub, email: req.user!.email } });
});
