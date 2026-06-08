// src/modules/devices/devices.repository.ts

import { query } from '../../config/db';

export interface DeviceRow {
  id: string;
  token: string;
  platform: string;
  active: boolean;
  user_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Insert a device, or re-activate/update it if the token already exists. */
export async function upsertByToken(
  token: string,
  platform: string,
  userId: string | null,
): Promise<DeviceRow> {
  const { rows } = await query<DeviceRow>(
    `INSERT INTO devices (token, platform, user_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (token) DO UPDATE SET
       platform   = EXCLUDED.platform,
       active     = TRUE,
       user_id    = COALESCE(EXCLUDED.user_id, devices.user_id),
       updated_at = now()
     RETURNING *`,
    [token, platform, userId],
  );
  return rows[0]!;
}

/** All active device tokens — the audience for a fired alert. */
export async function listActiveTokens(): Promise<string[]> {
  const { rows } = await query<{ token: string }>(
    'SELECT token FROM devices WHERE active = TRUE',
  );
  return rows.map((r) => r.token);
}

/** Deactivate a token Firebase reported as unregistered/invalid. */
export async function deactivateToken(token: string): Promise<void> {
  await query('UPDATE devices SET active = FALSE, updated_at = now() WHERE token = $1', [
    token,
  ]);
}
