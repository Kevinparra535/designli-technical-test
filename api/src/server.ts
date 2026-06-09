// src/server.ts
//
// Process entry point: run migrations, start the HTTP server, and start the
// real-time price hub (or the polling alert worker as a fallback). Handles
// graceful shutdown.

import { createApp } from './app';
import { pool } from './config/db';
import { env } from './config/env';
import { migrate } from './db/migrate';
import { seed } from './db/seed';
import { priceHub } from './modules/prices/priceHub';
import { attachPriceGateway } from './modules/prices/prices.gateway';
import { startAlertWorker, stopAlertWorker } from './worker/alertWorker';

async function main() {
  await migrate();
  console.log('[server] migrations applied');

  await seed();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[server] listening on http://0.0.0.0:${env.PORT}`);
  });

  if (env.STREAMING_ENABLED) {
    // Real-time hub: 1 upstream WS to Finnhub, fanned out to clients, alerts
    // evaluated inline. Supersedes the polling worker.
    await priceHub.start();
    attachPriceGateway(server);
  } else {
    // Fallback: evaluate alerts by polling Finnhub REST quotes.
    startAlertWorker();
  }

  const shutdown = (signal: string) => {
    console.log(`[server] ${signal} received, shutting down…`);
    if (env.STREAMING_ENABLED) priceHub.stop();
    else stopAlertWorker();
    server.close(() => {
      void pool.end().finally(() => process.exit(0));
    });
    // Force-exit if cleanup hangs.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[server] fatal startup error:', err);
  process.exit(1);
});
