// src/config/db.ts
//
// Single shared pg connection pool. Use `query` for one-off statements and
// `pool` directly when a transaction needs a dedicated client.

import { Pool, type QueryResultRow } from 'pg';

import { env } from './env';

// Heroku (and most managed Postgres) require SSL with a self-signed cert.
// Enable it when DATABASE_URL points at a remote host; keep it off for local.
const isLocal = /localhost|127\.0\.0\.1/.test(env.DATABASE_URL);
const useSsl = Boolean(env.DATABASE_URL) && !isLocal;

export const pool = new Pool(
  env.DATABASE_URL
    ? {
        connectionString: env.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: env.PGHOST,
        port: env.PGPORT,
        user: env.PGUSER,
        password: env.PGPASSWORD,
        database: env.PGDATABASE,
      },
);

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: readonly unknown[],
) {
  return pool.query<T>(text, params as unknown[] | undefined);
}
