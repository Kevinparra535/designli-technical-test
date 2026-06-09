// src/services/fcm.ts
//
// Thin wrapper around firebase-admin Cloud Messaging. Initialisation is lazy and
// tolerant: if no service account is configured the backend still boots and the
// rest of the API works — FCM sends just become no-ops with a warning. This lets
// you develop the alert flow before wiring real Firebase credentials.

import admin from 'firebase-admin';
import { readFileSync } from 'node:fs';

import { env } from '../config/env';

import type { AlertCondition } from './alerts';

let app: admin.app.App | null = null;
let initAttempted = false;

function loadServiceAccount(): admin.ServiceAccount | null {
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as admin.ServiceAccount;
  }
  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    const raw = readFileSync(env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
    return JSON.parse(raw) as admin.ServiceAccount;
  }
  return null;
}

function getApp(): admin.app.App | null {
  if (app || initAttempted) return app;
  initAttempted = true;
  try {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
      console.warn(
        '[fcm] No Firebase service account configured (FIREBASE_SERVICE_ACCOUNT / ' +
          'GOOGLE_APPLICATION_CREDENTIALS). Push notifications are disabled.',
      );
      return null;
    }
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[fcm] firebase-admin initialised');
  } catch (err) {
    console.error('[fcm] failed to initialise firebase-admin:', err);
    app = null;
  }
  return app;
}

export interface PriceAlertPush {
  token: string;
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
  currentPrice: number;
  alertId: string;
}

/**
 * Send a price-alert push to a single device token. The `data` payload mirrors
 * the contract the Expo app's foreground listener expects (all string-valued).
 * Returns true on success, false if FCM is disabled or the send failed.
 */
export async function sendPriceAlert(payload: PriceAlertPush): Promise<boolean> {
  const instance = getApp();
  if (!instance) return false;

  const { token, symbol, condition, targetPrice, currentPrice, alertId } = payload;
  try {
    await instance.messaging().send({
      token,
      notification: {
        title: `${symbol} hit your alert`,
        body: `Now $${currentPrice} (target $${targetPrice})`,
      },
      data: {
        symbol,
        targetPrice: String(targetPrice),
        currentPrice: String(currentPrice),
        condition,
        alertId,
      },
      android: { priority: 'high' },
    });
    return true;
  } catch (err) {
    console.error(`[fcm] send to ${token.slice(0, 12)}… failed:`, err);
    return false;
  }
}

export function isFcmEnabled(): boolean {
  return getApp() !== null;
}
