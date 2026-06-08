// src/modules/devices/devices.routes.ts
//
// POST /devices — register (upsert) a device's FCM token. Response shape matches
// the app's DeviceRegistrationModel: { id, token, platform, active, createdAt }.

import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../middleware/asyncHandler';
import { optionalAuth } from '../../middleware/auth';

import * as repo from './devices.repository';

const registerSchema = z.object({
  token: z.string().min(1, 'token is required'),
  platform: z.enum(['android', 'ios']).default('android'),
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
  asyncHandler(async (req, res) => {
    const { token, platform } = registerSchema.parse(req.body);
    const row = await repo.upsertByToken(token, platform, req.user?.sub ?? null);
    res.status(201).json(toJson(row));
  }),
);
