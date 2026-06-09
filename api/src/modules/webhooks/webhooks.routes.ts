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
import { optionalAuth } from '../../middleware/auth';
import { validatorHandler } from '../../middleware/validatorHandler';
import { decodeAlertEvent } from '../../services/alerts';
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

webhooksRouter.use(optionalAuth);

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
    const row = await repo.create(url, event, req.user?.id ?? null);
    // Watch this alert's symbol in the real-time hub straight away.
    priceHub.registerAlert(row);
    res.status(201).json(toJson(row));
  }),
);

webhooksRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await repo.list(req.user?.id ?? null);
    res.json(rows.map(toJson));
  }),
);

webhooksRouter.get(
  '/:id',
  validatorHandler(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const row = await repo.getById(req.params.id!);
    if (!row) throw HttpError.notFound('Webhook not found');
    res.json(toJson(row));
  }),
);

webhooksRouter.delete(
  '/:id',
  validatorHandler(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const ok = await repo.remove(req.params.id!);
    if (!ok) throw HttpError.notFound('Webhook not found');
    priceHub.removeAlert(req.params.id!);
    res.status(204).end();
  }),
);

webhooksRouter.post(
  '/:id/test',
  validatorHandler(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const row = await repo.getById(req.params.id!);
    if (!row) throw HttpError.notFound('Webhook not found');
    const result = await fireTestAlert(row);
    res.json(result);
  }),
);
