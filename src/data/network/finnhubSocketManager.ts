// src/data/network/finnhubSocketManager.ts
//
// Infra adapter over the Finnhub realtime websocket (wss://ws.finnhub.io).
// Manages a single shared connection, symbol subscriptions, fan-out of `trade`
// messages to listeners, and auto-reconnect with backoff. Returns raw DTOs —
// mapping to the domain is the RealtimePriceService's job.

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

const MAX_RECONNECT_ATTEMPTS = 5;

@injectable()
export class FinnhubSocketManagerImpl implements FinnhubSocketManager {
  private socket: WebSocket | null = null;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

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
      this.reconnectAttempts = 0;
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
      this.scheduleReconnect();
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
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

  private scheduleReconnect(): void {
    if (this.intentionalClose) return;
    if (this.subscriptions.size === 0) return;
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.logger.warn(
        'Realtime socket: max reconnect attempts reached, giving up.',
      );
      return;
    }

    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** (this.reconnectAttempts - 1), 15000);
    this.logger.info(
      `Reconnecting socket in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
    );
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private send(type: 'subscribe' | 'unsubscribe', symbol: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, symbol }));
    }
  }
}
