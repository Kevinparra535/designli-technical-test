// src/worker/alertWorker.ts
//
// Background poller. On each tick it loads every active alert, fetches a live
// quote per distinct symbol from Finnhub, and for any alert whose threshold has
// been crossed it pushes via FCM and deactivates the alert (so it fires once).

import { env } from '../config/env';
import {
  decodeAlertEvent,
  isCrossed,
  type DecodedAlert,
} from '../services/alerts';
import { getQuote, isFinnhubConfigured } from '../services/finnhub';
import { notifyDevices } from '../modules/webhooks/webhooks.notifier';
import * as webhooks from '../modules/webhooks/webhooks.repository';

let timer: NodeJS.Timeout | null = null;
let running = false;

async function tick(): Promise<void> {
  if (running) return; // skip if the previous tick is still in flight
  running = true;
  try {
    const rows = await webhooks.listActive();

    // Decode and keep only valid stock-price-alert events.
    const alerts = rows
      .map((row) => ({ row, decoded: decodeAlertEvent(row.event) }))
      .filter(
        (a): a is { row: (typeof rows)[number]; decoded: DecodedAlert } =>
          a.decoded !== null,
      );
    if (alerts.length === 0) return;

    // One quote per distinct symbol.
    const symbols = [...new Set(alerts.map((a) => a.decoded.symbol))];
    const prices = new Map<string, number>();
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await getQuote(symbol);
          if (typeof quote.c === 'number' && quote.c > 0) {
            prices.set(symbol, quote.c);
          }
        } catch (err) {
          console.error(`[worker] quote failed for ${symbol}:`, err);
        }
      }),
    );

    for (const { row, decoded } of alerts) {
      const price = prices.get(decoded.symbol);
      if (price === undefined) continue;
      if (!isCrossed(decoded, price)) continue;

      console.log(
        `[worker] ${decoded.symbol} ${decoded.condition} ${decoded.targetPrice} ` +
          `crossed at ${price} — notifying (alert ${row.id})`,
      );
      const result = await notifyDevices(
        row.id,
        decoded.symbol,
        decoded.condition,
        decoded.targetPrice,
        price,
      );
      await webhooks.markFired(row.id);
      console.log(
        `[worker] alert ${row.id}: sent ${result.sent}/${result.devices} pushes`,
      );
    }
  } catch (err) {
    console.error('[worker] tick failed:', err);
  } finally {
    running = false;
  }
}

export function startAlertWorker(): void {
  if (!env.ALERT_WORKER_ENABLED) {
    console.log('[worker] disabled (ALERT_WORKER_ENABLED=false)');
    return;
  }
  if (!isFinnhubConfigured()) {
    console.warn(
      '[worker] FINNHUB_API_KEY not set — alert evaluation will be skipped.',
    );
  }
  console.log(`[worker] starting, polling every ${env.POLL_INTERVAL_MS}ms`);
  timer = setInterval(() => void tick(), env.POLL_INTERVAL_MS);
  // Kick off an immediate first run.
  void tick();
}

export function stopAlertWorker(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
