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
//  - coalesce ticks and flush on a PER-CLIENT cadence (each client can request
//    its own throttleMs; defaults to PRICE_THROTTLE_MS) — mobile-friendly;
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

/** Per-client fan-out state: its cadence, pending (changed) symbols, and timer. */
interface ClientState {
  throttleMs: number;
  pending: Set<string>;
  timer: NodeJS.Timeout;
}

interface AlertEntry extends DecodedAlert {
  id: string;
  userId: string | null;
  firing: boolean;
}

interface PricePoint {
  price: number;
  t: number;
}

// Bounds for a client-requested cadence (protects against abuse / busy loops).
const MIN_THROTTLE_MS = 100;
const MAX_THROTTLE_MS = 10000;

class PriceHub {
  private readonly lastPrice = new Map<string, PricePoint>();
  /** symbol → number of holders (client subscriptions + alerts). */
  private readonly refs = new Map<string, number>();
  /** symbol → active alerts on it. */
  private readonly alerts = new Map<string, AlertEntry[]>();
  /** alertId → symbol (so DELETE / fire can release the right ref). */
  private readonly alertSymbol = new Map<string, string>();
  /** client → its fan-out state. */
  private readonly clients = new Map<StreamClient, ClientState>();
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

    console.log(
      `[hub] started — ${loaded} active alert(s), default cadence ${env.PRICE_THROTTLE_MS}ms`,
    );
  }

  stop(): void {
    this.started = false;
    for (const state of this.clients.values()) clearInterval(state.timer);
    this.clients.clear();
    finnhubSocket.stop();
  }

  // --- client lifecycle (called by the gateway) ----------------------------

  addClient(client: StreamClient): void {
    if (this.clients.has(client)) return;
    const throttleMs = env.PRICE_THROTTLE_MS;
    const state: ClientState = {
      throttleMs,
      pending: new Set<string>(),
      timer: setInterval(() => this.flushClient(client), throttleMs),
    };
    this.clients.set(client, state);
  }

  removeClient(client: StreamClient): void {
    const state = this.clients.get(client);
    if (state) clearInterval(state.timer);
    this.clients.delete(client);
    for (const symbol of client.subscriptions) this.release(symbol);
    client.subscriptions.clear();
  }

  subscribe(client: StreamClient, symbols: string[], throttleMs?: number): void {
    if (throttleMs !== undefined) this.setThrottle(client, throttleMs);

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

  /** Change a client's fan-out cadence (clamped). Restarts its timer. */
  setThrottle(client: StreamClient, throttleMs: number): void {
    const state = this.clients.get(client);
    if (!state || !Number.isFinite(throttleMs)) return;
    const next = Math.min(MAX_THROTTLE_MS, Math.max(MIN_THROTTLE_MS, throttleMs));
    if (next === state.throttleMs) return;
    state.throttleMs = next;
    clearInterval(state.timer);
    state.timer = setInterval(() => this.flushClient(client), next);
    client.send({ type: 'throttle', throttleMs: next });
  }

  // --- alerts --------------------------------------------------------------

  /** Add an active alert to the in-memory watch set (called on create + boot). */
  registerAlert(row: webhooks.WebhookRow): void {
    const decoded = decodeAlertEvent(row.event);
    if (!decoded) return;
    const symbol = decoded.symbol.toUpperCase();
    const entry: AlertEntry = {
      ...decoded,
      symbol,
      id: row.id,
      userId: row.user_id,
      firing: false,
    };

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

    // Mark the symbol pending for every client watching it; each client drains
    // its own pending set on its own cadence.
    for (const [client, state] of this.clients) {
      if (client.subscriptions.has(symbol)) state.pending.add(symbol);
    }

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
          entry.userId,
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

  /** Drain one client's pending symbols and send the coalesced prices to it. */
  private flushClient(client: StreamClient): void {
    const state = this.clients.get(client);
    if (!state || state.pending.size === 0) return;

    const data: { symbol: string; price: number; t: number }[] = [];
    for (const symbol of state.pending) {
      const last = this.lastPrice.get(symbol);
      if (last && client.subscriptions.has(symbol)) {
        data.push({ symbol, price: last.price, t: last.t });
      }
    }
    state.pending.clear();
    if (data.length) client.send({ type: 'prices', data });
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
