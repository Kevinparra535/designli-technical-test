// src/modules/devices/devices.routes.ts
//
// Requires a valid JWT (Passport JwtStrategy) — every device is tied to the
// authenticated user, never anonymous.
//   POST /devices       register (upsert) this device's FCM token for the user
//   POST /devices/test  send a test push to all of the user's devices

import { Router } from 'express';
import Joi from 'joi';

import { asyncHandler } from '../../middleware/asyncHandler';
import { validatorHandler } from '../../middleware/validatorHandler';
import { isFcmEnabled, sendTestPush } from '../../services/fcm';
import { authenticateJwt } from '../auth/passport';

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

// All device routes require authentication.
devicesRouter.use(authenticateJwt);

devicesRouter.post(
  '/',
  validatorHandler(registerSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { token, platform } = req.body as { token: string; platform: string };
    const row = await repo.upsertByToken(token, platform, req.user!.id);
    res.status(201).json(toJson(row));
  }),
);

// Fire a test push to every active device the user has registered. Lets you
// confirm end-to-end FCM delivery without waiting for a price to cross an alert.
devicesRouter.post(
  '/test',
  asyncHandler(async (req, res) => {
    const tokens = await repo.listActiveTokensForUser(req.user!.id);

    let sent = 0;
    let failed = 0;
    const results: { token: string; ok: boolean }[] = [];
    for (const token of tokens) {
      const ok = await sendTestPush(token);
      if (ok) sent += 1;
      else failed += 1;
      results.push({ token: `${token.slice(0, 12)}…`, ok });
    }

    res.json({
      fcm: isFcmEnabled(),
      devices: tokens.length,
      sent,
      failed,
      message:
        tokens.length === 0
          ? 'No active devices for this user. Register one via POST /devices first.'
          : `Sent ${sent}/${tokens.length} test push(es).`,
      results,
    });
  }),
);
