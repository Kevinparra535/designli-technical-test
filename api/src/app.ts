// src/app.ts
//
// Express application wiring: middleware, routes, health check, and the central
// error handler. Kept separate from server.ts so it can be imported in tests.

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { isFcmEnabled } from './services/fcm';
import { isFinnhubConfigured } from './services/finnhub';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { devicesRouter } from './modules/devices/devices.routes';
import { webhooksRouter } from './modules/webhooks/webhooks.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Health / readiness — also reports which integrations are configured.
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      fcm: isFcmEnabled(),
      finnhub: isFinnhubConfigured(),
    });
  });

  app.use('/auth', authRouter);
  app.use('/devices', devicesRouter);
  app.use('/webhooks', webhooksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
