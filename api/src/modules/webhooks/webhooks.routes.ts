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
import { z } from 'zod';

import { HttpError } from '../../lib/httpError';
import { asyncHandler } from '../../middleware/asyncHandler';
import { optionalAuth } from '../../middleware/auth';
import { decodeAlertEvent } from '../../services/alerts';
import { fireTestAlert } from './webhooks.notifier';
import * as repo from './webhooks.repository';

const createSchema = z.object({
  url: z.string().default(''),
  event: z.string().min(1, 'event is required'),
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
  asyncHandler(async (req, res) => {
    const { url, event } = createSchema.parse(req.body);
    // Reject malformed alert events early so the worker never sees garbage.
    if (!decodeAlertEvent(event)) {
      throw HttpError.badRequest(
        'event must be "stock-price-alert:<SYMBOL>:<above|below>:<targetPrice>"',
      );
    }
    const row = await repo.create(url, event, req.user?.sub ?? null);
    res.status(201).json(toJson(row));
  }),
);

webhooksRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await repo.list(req.user?.sub ?? null);
    res.json(rows.map(toJson));
  }),
);

webhooksRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await repo.getById(req.params.id!);
    if (!row) throw HttpError.notFound('Webhook not found');
    res.json(toJson(row));
  }),
);

webhooksRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const ok = await repo.remove(req.params.id!);
    if (!ok) throw HttpError.notFound('Webhook not found');
    res.status(204).end();
  }),
);

webhooksRouter.post(
  '/:id/test',
  asyncHandler(async (req, res) => {
    const row = await repo.getById(req.params.id!);
    if (!row) throw HttpError.notFound('Webhook not found');
    const result = await fireTestAlert(row);
    res.json(result);
  }),
);
