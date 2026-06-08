// src/modules/webhooks/webhooks.notifier.ts
//
// Shared fan-out: given an alert and a current price, push to every active
// device. Used by both the background worker (real crossings) and the
// POST /webhooks/:id/test endpoint (manual trigger).

import * as devices from '../devices/devices.repository';
import { decodeAlertEvent } from '../../services/alerts';
import { sendPriceAlert } from '../../services/fcm';
import type { WebhookRow } from './webhooks.repository';

export interface NotifyResult {
  alertId: string;
  symbol: string;
  currentPrice: number;
  devices: number;
  sent: number;
  failed: number;
}

/** Push an alert to all active device tokens. */
export async function notifyDevices(
  alertId: string,
  symbol: string,
  condition: 'above' | 'below',
  targetPrice: number,
  currentPrice: number,
): Promise<NotifyResult> {
  const tokens = await devices.listActiveTokens();
  let sent = 0;
  let failed = 0;

  for (const token of tokens) {
    const ok = await sendPriceAlert({
      token,
      symbol,
      condition,
      targetPrice,
      currentPrice,
      alertId,
    });
    if (ok) sent += 1;
    else failed += 1;
  }

  return { alertId, symbol, currentPrice, devices: tokens.length, sent, failed };
}

/**
 * Fire a test notification for an alert using a synthetic price that satisfies
 * the condition. Does NOT deactivate the alert.
 */
export async function fireTestAlert(row: WebhookRow): Promise<NotifyResult> {
  const decoded = decodeAlertEvent(row.event);
  if (!decoded) {
    return {
      alertId: row.id,
      symbol: 'UNKNOWN',
      currentPrice: 0,
      devices: 0,
      sent: 0,
      failed: 0,
    };
  }
  // A price that clearly crosses the threshold, just for the test push.
  const currentPrice =
    decoded.condition === 'above'
      ? decoded.targetPrice + 1
      : Math.max(0, decoded.targetPrice - 1);

  return notifyDevices(
    row.id,
    decoded.symbol,
    decoded.condition,
    decoded.targetPrice,
    currentPrice,
  );
}
