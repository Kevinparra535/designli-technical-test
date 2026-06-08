// src/modules/devices/devices.routes.ts
//
// POST /devices — register (upsert) a device's FCM token. Response shape matches
// the app's DeviceRegistrationModel: { id, token, platform, active, createdAt }.

import { Router } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../../middleware/asyncHandler';
import { optionalAuth } from '../../middleware/auth';
import { validatorHandler } from '../../middleware/validatorHandler';

import * as repo from './devices.repository';

const registerSchema = Joi.object({
  token: Joi.string().min(1).required(),
  platform: Joi.string().valid('android', 'ios').default('android'),
});

function toJson(row: repo.DeviceRow) {
  return {
    id: row.id,
    token: row.token,
    platform: row.platform,
    active: row.active,
    createdAt: row.created_at.toISOString(),
  };
}

export const devicesRouter = Router();

devicesRouter.post(
  '/',
  optionalAuth,
  validatorHandler(registerSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { token, platform } = req.body as { token: string; platform: string };
    const row = await repo.upsertByToken(token, platform, req.user?.sub ?? null);
    res.status(201).json(toJson(row));
  }),
);
