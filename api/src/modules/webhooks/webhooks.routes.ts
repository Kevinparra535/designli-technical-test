// src/modules/webhooks/webhooks.routes.ts
//
// Stock price alerts, stored as generic "webhooks" to match the app's
// WebhookManager. Response shape: { id, url, event, active, createdAt }.
//   POST   /webhooks           create an alert
//   GET    /webhooks           list alerts
//   GET    /webhooks/:id       fetch one
//   DELETE /webhooks/:id       remove one
//   POST   /webhooks/:id/test  fire a test push immediately

import { Router } from 'express';
import Joi from 'joi';

import { HttpError } from '../../lib/httpError';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validatorHandler } from '../../middleware/validatorHandler';
import { decodeAlertEvent } from '../../services/alerts';
import { authenticateJwt } from '../auth/passport';
import { priceHub } from '../prices/priceHub';

import { fireTestAlert } from './webhooks.notifier';
import * as repo from './webhooks.repository';

const createSchema = Joi.object({
  url: Joi.string().allow('').default(''),
  event: Joi.string().min(1).required(),
});

const idParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

function toJson(row: repo.WebhookRow) {
  return {
    id: row.id,
    url: row.url,
    event: row.event,
    active: row.active,
    createdAt: row.created_at.toISOString(),
  };
}

export const webhooksRouter = Router();

// All alert routes require authentication; alerts are always tied to a user.
webhooksRouter.use(authenticateJwt);

/** Fetch a webhook and assert the authenticated user owns it (404 otherwise). */
async function getOwned(id: string, userId: string): Promise<repo.WebhookRow> {
  const row = await repo.getById(id);
  if (!row || row.user_id !== userId) throw HttpError.notFound('Webhook not found');
  return row;
}

webhooksRouter.post(
  '/',
  validatorHandler(createSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { url, event } = req.body as { url: string; event: string };
    // Reject malformed alert events early so the worker never sees garbage.
    if (!decodeAlertEvent(event)) {
      throw HttpError.badRequest(
        'event must be "stock-price-alert:<SYMBOL>:<above|below>:<targetPrice>"',
      );
    }
    const row = await repo.create(url, event, req.user!.id);
    // Watch this alert's symbol in the real-time hub straight away.
    priceHub.registerAlert(row);
    res.status(201).json(toJson(row));
  }),
);

webhooksRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await repo.list(req.user!.id);
    res.json(rows.map(toJson));
  }),
);

webhooksRouter.get(
  '/:id',
  validatorHandler(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const row = await getOwned(req.params.id!, req.user!.id);
    res.json(toJson(row));
  }),
);

webhooksRouter.delete(
  '/:id',
  validatorHandler(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    await getOwned(req.params.id!, req.user!.id); // 404 if not owner
    await repo.remove(req.params.id!);
    priceHub.removeAlert(req.params.id!);
    res.status(204).end();
  }),
);

webhooksRouter.post(
  '/:id/test',
  validatorHandler(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const row = await getOwned(req.params.id!, req.user!.id);
    const result = await fireTestAlert(row);
    res.json(result);
  }),
);
