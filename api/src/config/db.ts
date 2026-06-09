// src/config/db.ts
//
// Single shared pg connection pool. Use `query` for one-off statements and
// `pool` directly when a transaction needs a dedicated client.

import { Pool, type QueryResultRow } from 'pg';

import { env } from './env';

export const pool = new Pool(
  env.DATABASE_URL
    ? { connectionString: env.DATABASE_URL }
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
