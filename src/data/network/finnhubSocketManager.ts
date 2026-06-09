// src/data/network/finnhubSocketManager.ts
//
// Infra adapter over the Finnhub realtime websocket (wss://ws.finnhub.io).
// Manages a single shared connection, symbol subscriptions, fan-out of `trade`
// messages to listeners, and resilient reconnect.
//
// Reconnect strategy (the free tier periodically ends the stream with code 1001,
// and rate-limits aggressive reconnects with HTTP 429):
//   - exponential backoff, base 3s, capped at 30s — never a tight loop;
//   - a 429 close forces at least a 30s cooldown;
//   - the backoff resets ONLY after the connection stays healthy for 20s, so a
//     flapping connection keeps backing off instead of hammering the server;
//   - retries indefinitely (until disconnect / no subscriptions) so the feed
//     self-heals once the free-tier window reopens.

import { injectable } from 'inversify';

import { config } from '@/config/config';

import Logger from '@/ui/utils/Logger';

export type FinnhubTradeDto = {
  s: string;
  p: number;
  t: number;
  v: number;
};

export interface FinnhubSocketManager {
  connect(): void;
  disconnect(): void;
  subscribe(symbol: string): void;
  unsubscribe(symbol: string): void;
  onTrade(listener: (trades: FinnhubTradeDto[]) => void): () => void;
}

const BASE_RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;
const RATE_LIMIT_COOLDOWN = 30000;
const HEALTHY_AFTER = 20000;

@injectable()
export class FinnhubSocketManagerImpl implements FinnhubSocketManager {
  private socket: WebSocket | null = null;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private healthyTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly listeners = new Set<(trades: FinnhubTradeDto[]) => void>();
  private readonly subscriptions = new Set<string>();
  private readonly logger = new Logger('FinnhubSocketManager');

  connect(): void {
    if (this.socket) return;
    if (!config.FINNHUB_API_KEY) {
      this.logger.error(
        'Finnhub API key is not configured; cannot open socket.',
      );
      return;
    }

    this.intentionalClose = false;
    const socket = new WebSocket(
      `${config.FINNHUB_SOCKET_URL}?token=${config.FINNHUB_API_KEY}`,
    );
    this.socket = socket;

    socket.onopen = () => {
      this.logger.info('Realtime socket connected');
      // Reset the backoff ONLY once the connection proves stable — otherwise a
      // connection that opens then immediately closes would loop at the base
      // delay forever (and trip the 429 rate limit).
      this.clearHealthyTimer();
      this.healthyTimer = setTimeout(() => {
        this.reconnectAttempts = 0;
      }, HEALTHY_AFTER);
      // (Re)subscribe everything requested while disconnected.
      this.subscriptions.forEach((symbol) => this.send('subscribe', symbol));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data));
        if (message.type === 'trade' && Array.isArray(message.data)) {
          this.listeners.forEach((listener) => listener(message.data));
        } else if (message.type === 'error') {
          this.logger.warn(`Realtime socket server error: ${message.msg}`);
        }
      } catch (error) {
        this.logger.error(
          `Bad socket message: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    };

    socket.onerror = (event) => {
      const message = (event as { message?: string }).message;
      this.logger.warn(`Realtime socket error: ${message ?? 'unknown'}`);
    };

    socket.onclose = (event) => {
      this.logger.info(
        `Realtime socket closed (code=${event.code}, reason="${
          event.reason || 'none'
        }")`,
      );
      this.socket = null;
      this.clearHealthyTimer();
      this.scheduleReconnect(event.reason);
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearHealthyTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.subscriptions.clear();
    this.socket?.close();
    this.socket = null;
  }

  subscribe(symbol: string): void {
    this.subscriptions.add(symbol);
    this.send('subscribe', symbol);
  }

  unsubscribe(symbol: string): void {
    this.subscriptions.delete(symbol);
    this.send('unsubscribe', symbol);
  }

  onTrade(listener: (trades: FinnhubTradeDto[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private scheduleReconnect(reason?: string): void {
    if (this.intentionalClose) return;
    // Nothing to listen for — don't keep a connection alive pointlessly.
    if (this.subscriptions.size === 0) return;

    this.reconnectAttempts += 1;
    const rateLimited = !!reason && reason.includes('429');
    const backoff = Math.min(
      BASE_RECONNECT_DELAY * 2 ** (this.reconnectAttempts - 1),
      MAX_RECONNECT_DELAY,
    );
    const delay = rateLimited
      ? Math.max(backoff, RATE_LIMIT_COOLDOWN)
      : backoff;

    this.logger.info(
      `Reconnecting socket in ${delay}ms (attempt ${this.reconnectAttempts}${
        rateLimited ? ', rate-limited' : ''
      })`,
    );
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private clearHealthyTimer(): void {
    if (this.healthyTimer) {
      clearTimeout(this.healthyTimer);
      this.healthyTimer = null;
    }
  }

  private send(type: 'subscribe' | 'unsubscribe', symbol: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, symbol }));
    }
  }
}
