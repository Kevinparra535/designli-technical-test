// src/db/seed.ts
//
// Idempotent seed for a known test/QA user. Runs after migrations on boot (when
// SEED_TEST_USER is enabled) so the deployed app always has a login that
// reviewers / App Check can use — no manual step required.
//
// Idempotent by design: the row is upserted by email, so re-running never
// duplicates and always re-asserts the known password (handy if JWT_SECRET or
// the DB were reset). Disable in a real production by setting SEED_TEST_USER=false.

import bcrypt from 'bcryptjs';

import { pool } from '../config/db';
import { env } from '../config/env';

export async function seed(): Promise<void> {
  if (!env.SEED_TEST_USER) return;

  const email = env.TEST_USER_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(env.TEST_USER_PASSWORD, 10);

  await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, passwordHash],
  );

  console.log(`[seed] test user ensured: ${email}`);
}

// When executed directly (npm run seed), run and exit.
if (require.main === module) {
  seed()
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[seed] failed:', err);
      process.exit(1);
    });
}
