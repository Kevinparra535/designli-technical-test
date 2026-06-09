// src/modules/webhooks/webhooks.repository.ts

import { query } from '../../config/db';

export interface WebhookRow {
  id: string;
  url: string;
  event: string;
  active: boolean;
  user_id: string | null;
  last_fired_at: Date | null;
  created_at: Date;
}

export async function create(
  url: string,
  event: string,
  userId: string,
): Promise<WebhookRow> {
  const { rows } = await query<WebhookRow>(
    `INSERT INTO webhooks (url, event, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [url, event, userId],
  );
  return rows[0]!;
}

export async function list(userId: string): Promise<WebhookRow[]> {
  // Each user only sees their own alerts.
  const { rows } = await query<WebhookRow>(
    `SELECT * FROM webhooks
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function getById(id: string): Promise<WebhookRow | null> {
  const { rows } = await query<WebhookRow>('SELECT * FROM webhooks WHERE id = $1', [
    id,
  ]);
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const { rowCount } = await query('DELETE FROM webhooks WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

/** Active stock-price-alert webhooks — the worker's evaluation set. */
export async function listActive(): Promise<WebhookRow[]> {
  const { rows } = await query<WebhookRow>(
    `SELECT * FROM webhooks WHERE active = TRUE`,
  );
  return rows;
}

/** Mark an alert as fired so it does not notify repeatedly. */
export async function markFired(id: string): Promise<void> {
  await query(
    'UPDATE webhooks SET active = FALSE, last_fired_at = now() WHERE id = $1',
    [id],
  );
}
