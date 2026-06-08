-- Schema for the stocks backend.
-- gen_random_uuid() is built into PostgreSQL 13+ (no extension needed).

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Device FCM tokens. Upserted by token. Optionally tied to a user once the app
-- sends an auth token on POST /devices.
CREATE TABLE IF NOT EXISTS devices (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT NOT NULL UNIQUE,
  platform   TEXT NOT NULL DEFAULT 'android',
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stock price alerts. The app encodes the alert into the `event` string:
--   stock-price-alert:<SYMBOL>:<above|below>:<targetPrice>
-- `active` is flipped to FALSE once the alert fires so it does not re-notify.
CREATE TABLE IF NOT EXISTS webhooks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url        TEXT NOT NULL DEFAULT '',
  event      TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  last_fired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks (active);
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices (active);
