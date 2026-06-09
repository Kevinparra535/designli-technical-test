// src/config/env.ts
//
// Loads and validates environment variables once at startup. Anything required
// for the process to function is validated here so failures surface early with a
// clear message instead of as an undefined value deep in a request handler.

import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

function number(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: number('PORT', 3000),

  // Postgres — either a single DATABASE_URL or discrete PG* parts.
  DATABASE_URL: optional('DATABASE_URL'),
  PGHOST: optional('PGHOST', 'localhost'),
  PGPORT: number('PGPORT', 5432),
  PGUSER: optional('PGUSER', 'postgres'),
  PGPASSWORD: optional('PGPASSWORD', 'postgres'),
  PGDATABASE: optional('PGDATABASE', 'stocks'),

  // Auth
  JWT_SECRET: required('JWT_SECRET', 'dev-insecure-secret-change-me'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),

  // Finnhub (server-side key — separate from the app's EXPO_PUBLIC_ key).
  FINNHUB_BASE_URL: optional('FINNHUB_BASE_URL', 'https://finnhub.io/api/v1'),
  FINNHUB_WS_URL: optional('FINNHUB_WS_URL', 'wss://ws.finnhub.io'),
  FINNHUB_API_KEY: optional('FINNHUB_API_KEY'),

  // Real-time price hub. When enabled, a single upstream WebSocket to Finnhub is
  // fanned out to app clients (path WS_PATH) and used to evaluate alerts inline —
  // the polling worker is then NOT started. Disable to fall back to polling.
  STREAMING_ENABLED: optional('STREAMING_ENABLED', 'true') !== 'false',
  WS_PATH: optional('WS_PATH', '/ws'),
  // Coalescing window: ticks are buffered and flushed to clients at most this
  // often per symbol (protects mobile clients from re-render storms).
  PRICE_THROTTLE_MS: number('PRICE_THROTTLE_MS', 400),

  // Firebase Cloud Messaging service account. Provide ONE of:
  //  - GOOGLE_APPLICATION_CREDENTIALS: path to the serviceAccount.json file, or
  //  - FIREBASE_SERVICE_ACCOUNT: the JSON content itself (handy for containers).
  GOOGLE_APPLICATION_CREDENTIALS: optional('GOOGLE_APPLICATION_CREDENTIALS'),
  FIREBASE_SERVICE_ACCOUNT: optional('FIREBASE_SERVICE_ACCOUNT'),

  // Alert evaluation worker.
  POLL_INTERVAL_MS: number('POLL_INTERVAL_MS', 15000),
  ALERT_WORKER_ENABLED: optional('ALERT_WORKER_ENABLED', 'true') !== 'false',

  // Test/QA user seed (idempotent, runs after migrations). Lets reviewers and
  // App Check log in without a manual step. Set SEED_TEST_USER=false to disable.
  SEED_TEST_USER: optional('SEED_TEST_USER', 'true') !== 'false',
  TEST_USER_EMAIL: optional('TEST_USER_EMAIL', 'appcheck@test.com'),
  TEST_USER_PASSWORD: optional('TEST_USER_PASSWORD', 'password123'),
} as const;

export const isProd = env.NODE_ENV === 'production';
