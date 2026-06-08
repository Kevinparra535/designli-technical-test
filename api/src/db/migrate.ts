// src/db/migrate.ts
//
// Applies schema.sql. Idempotent (every statement is IF NOT EXISTS), so it is
// safe to run on every boot. Also runnable standalone via `npm run migrate`.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { pool } from '../config/db';

export async function migrate(): Promise<void> {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
}

// When executed directly (npm run migrate), run and exit.
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('[migrate] schema applied');
      return pool.end();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[migrate] failed:', err);
      process.exit(1);
    });
}
