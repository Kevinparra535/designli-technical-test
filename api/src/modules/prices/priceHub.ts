// src/modules/prices/priceHub.ts
//
// Application service for real-time prices. It is the single fan-out hub:
//
//   Finnhub (1 upstream WS)  ─▶  PriceHub  ─▶  N app clients (fan-out)
//
// Responsibilities:
//  - de-duplicate symbol subscriptions across all clients + alerts (ref-count),
//    subscribing/unsubscribing the upstream socket only on 0↔1 transitions;
//  - keep the last price per symbol (snapshot for new subscribers);
//  - coalesce ticks and flush at most every PRICE_THROTTLE_MS (mobile-friendly);
//  - evaluate price alerts inline on each tick (no polling) → FCM + deactivate.
//
// Transport-agnostic: it talks to clients through the StreamClient interface, so
// it has no dependency on `ws` (that lives in the gateway).

import { env } from '../../config/env';
import {
  type AlertCondition,
  decodeAlertEvent,
  type DecodedAlert,
  isCrossed,
} from '../../services/alerts';
import { finnhubSocket, type Trade } from '../../services/finnhubSocket';
import { notifyDevices } from '../webhooks/webhooks.notifier';
import * as webhooks from '../webhooks/webhooks.repository';

/** A connected app client, as seen by the hub (implemented by the gateway). */
export interface StreamClient {
  send(message: unknown): void;
  readonly subscriptions: Set<string>;
}

interface AlertEntry extends DecodedAlert {
  id: string;
  firing: boolean;
}

interface PricePoint {
  price: number;
  t: number;
}

class PriceHub {
  private readonly lastPrice = new Map<string, PricePoint>();
  private readonly dirty = new Set<string>();
  /** symbol → number of holders (client subscriptions + alerts). */
  private readonly refs = new Map<string, number>();
  /** symbol → active alerts on it. */
  private readonly alerts = new Map<string, AlertEntry[]>();
  /** alertId → symbol (so DELETE / fire can release the right ref). */
  private readonly alertSymbol = new Map<string, string>();
  private readonly clients = new Set<StreamClient>();
  private flushTimer: NodeJS.Timeout | null = null;
  private started = false;

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;

    finnhubSocket.onTrade((trade) => this.onTrade(trade));
    finnhubSocket.start();

    // Load existing active alerts so their symbols are watched even with no
    // app client connected. Tolerate a missing DB so the stream still works.
    let loaded = 0;
    try {
      const rows = await webhooks.listActive();
      for (const row of rows) this.registerAlert(row);
      loaded = rows.length;
    } catch (err) {
      console.error('[hub] could not load active alerts:', err);
    }

    this.flushTimer = setInterval(() => this.flush(), env.PRICE_THROTTLE_MS);
    console.log(
      `[hub] started — ${loaded} active alert(s), flush every ${env.PRICE_THROTTLE_MS}ms`,
    );
  }

  stop(): void {
    this.started = false;
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = null;
    finnhubSocket.stop();
  }

  // --- client lifecycle (called by the gateway) ----------------------------

  addClient(client: StreamClient): void {
    this.clients.add(client);
  }

  removeClient(client: StreamClient): void {
    this.clients.delete(client);
    for (const symbol of client.subscriptions) this.release(symbol);
    client.subscriptions.clear();
  }

  subscribe(client: StreamClient, symbols: string[]): void {
    const snapshot: { symbol: string; price: number; t: number }[] = [];
    for (const raw of symbols) {
      const symbol = raw.trim().toUpperCase();
      if (!symbol || client.subscriptions.has(symbol)) continue;
      client.subscriptions.add(symbol);
      this.retain(symbol);
      const last = this.lastPrice.get(symbol);
      if (last) snapshot.push({ symbol, price: last.price, t: last.t });
    }
    if (snapshot.length) client.send({ type: 'snapshot', data: snapshot });
  }

  unsubscribe(client: StreamClient, symbols: string[]): void {
    for (const raw of symbols) {
      const symbol = raw.trim().toUpperCase();
      if (!client.subscriptions.delete(symbol)) continue;
      this.release(symbol);
    }
  }

  // --- alerts --------------------------------------------------------------

  /** Add an active alert to the in-memory watch set (called on create + boot). */
  registerAlert(row: webhooks.WebhookRow): void {
    const decoded = decodeAlertEvent(row.event);
    if (!decoded) return;
    const symbol = decoded.symbol.toUpperCase();
    const entry: AlertEntry = { ...decoded, symbol, id: row.id, firing: false };

    const list = this.alerts.get(symbol) ?? [];
    list.push(entry);
    this.alerts.set(symbol, list);
    this.alertSymbol.set(row.id, symbol);
    this.retain(symbol);
  }

  /** Drop an alert from the watch set (called on DELETE and after it fires). */
  removeAlert(alertId: string): void {
    const symbol = this.alertSymbol.get(alertId);
    if (!symbol) return;
    this.alertSymbol.delete(alertId);
    const list = (this.alerts.get(symbol) ?? []).filter((a) => a.id !== alertId);
    if (list.length) this.alerts.set(symbol, list);
    else this.alerts.delete(symbol);
    this.release(symbol);
  }

  // --- tick handling -------------------------------------------------------

  private onTrade(trade: Trade): void {
    const symbol = trade.symbol.toUpperCase();
    this.lastPrice.set(symbol, { price: trade.price, t: trade.timestamp });
    this.dirty.add(symbol);
    void this.evaluateAlerts(symbol, trade.price);
  }

  private async evaluateAlerts(symbol: string, price: number): Promise<void> {
    const entries = this.alerts.get(symbol);
    if (!entries) return;

    for (const entry of entries) {
      if (entry.firing) continue;
      if (!isCrossed(entry, price)) continue;

      entry.firing = true; // guard against re-fire on subsequent ticks
      try {
        console.log(
          `[hub] alert ${entry.id}: ${symbol} ${entry.condition} ` +
            `${entry.targetPrice} crossed at ${price} — notifying`,
        );
        await notifyDevices(
          entry.id,
          symbol,
          entry.condition as AlertCondition,
          entry.targetPrice,
          price,
        );
        await webhooks.markFired(entry.id);
      } catch (err) {
        console.error(`[hub] failed to fire alert ${entry.id}:`, err);
        entry.firing = false; // allow a retry on a later tick
        continue;
      }
      this.removeAlert(entry.id);
    }
  }

  /** Fan out coalesced price updates to subscribed clients. */
  private flush(): void {
    if (this.dirty.size === 0) return;

    const updates: { symbol: string; price: number; t: number }[] = [];
    for (const symbol of this.dirty) {
      const last = this.lastPrice.get(symbol);
      if (last) updates.push({ symbol, price: last.price, t: last.t });
    }
    this.dirty.clear();

    for (const client of this.clients) {
      const slice = updates.filter((u) => client.subscriptions.has(u.symbol));
      if (slice.length) client.send({ type: 'prices', data: slice });
    }
  }

  // --- subscription ref-counting ------------------------------------------

  private retain(symbol: string): void {
    const next = (this.refs.get(symbol) ?? 0) + 1;
    this.refs.set(symbol, next);
    if (next === 1) finnhubSocket.subscribe(symbol);
  }

  private release(symbol: string): void {
    const current = this.refs.get(symbol) ?? 0;
    if (current <= 1) {
      this.refs.delete(symbol);
      finnhubSocket.unsubscribe(symbol);
    } else {
      this.refs.set(symbol, current - 1);
    }
  }
}

export const priceHub = new PriceHub();
