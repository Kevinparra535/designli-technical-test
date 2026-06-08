// src/server.ts
//
// Process entry point: run migrations, start the HTTP server, and launch the
// alert worker. Handles graceful shutdown.

import { createApp } from './app';
import { pool } from './config/db';
import { env } from './config/env';
import { migrate } from './db/migrate';
import { startAlertWorker, stopAlertWorker } from './worker/alertWorker';

async function main() {
  await migrate();
  console.log('[server] migrations applied');

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[server] listening on http://0.0.0.0:${env.PORT}`);
  });

  startAlertWorker();

  const shutdown = (signal: string) => {
    console.log(`[server] ${signal} received, shutting down…`);
    stopAlertWorker();
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
