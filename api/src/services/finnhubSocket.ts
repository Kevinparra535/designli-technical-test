// src/services/finnhubSocket.ts
//
// Infrastructure adapter for Finnhub's real-time trade WebSocket
// (wss://ws.finnhub.io?token=...). One process-wide connection. It owns nothing
// about business logic — it just exposes subscribe/unsubscribe and emits trade
// ticks, and keeps itself connected (reconnect with backoff, re-subscribe on
// reconnect). If no API key is configured it stays dormant (no-op) so the rest
// of the app keeps working in dev.

import WebSocket from 'ws';

import { env } from '../config/env';

export interface Trade {
  symbol: string;
  price: number;
  timestamp: number;
}

type TradeListener = (trade: Trade) => void;

interface FinnhubTradeMessage {
  type: 'trade' | 'ping' | string;
  data?: { s: string; p: number; t: number; v: number }[];
}

class FinnhubSocket {
  private ws: WebSocket | null = null;
  /** Symbols we want subscribed upstream (survives reconnects). */
  private readonly desired = new Set<string>();
  private readonly listeners = new Set<TradeListener>();
  private reconnectDelay = 1000;
  private reconnecting = false;
  private started = false;

  start(): void {
    if (this.started) return;
    if (!env.FINNHUB_API_KEY) {
      console.warn(
        '[finnhub-ws] FINNHUB_API_KEY not set — real-time stream disabled.',
      );
      return;
    }
    this.started = true;
    this.connect();
  }

  onTrade(listener: TradeListener): void {
    this.listeners.add(listener);
  }

  subscribe(symbol: string): void {
    if (this.desired.has(symbol)) return;
    this.desired.add(symbol);
    this.send({ type: 'subscribe', symbol });
  }

  unsubscribe(symbol: string): void {
    if (!this.desired.delete(symbol)) return;
    this.send({ type: 'unsubscribe', symbol });
  }

  stop(): void {
    this.started = false;
    this.desired.clear();
    this.ws?.removeAllListeners();
    this.ws?.close();
    this.ws = null;
  }

  // --- internals -----------------------------------------------------------

  private connect(): void {
    const url = `${env.FINNHUB_WS_URL}?token=${env.FINNHUB_API_KEY}`;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.on('open', () => {
      console.log('[finnhub-ws] connected');
      this.reconnectDelay = 1000;
      // Re-subscribe everything we want after a (re)connect.
      for (const symbol of this.desired) {
        this.send({ type: 'subscribe', symbol });
      }
    });

    ws.on('message', (raw: WebSocket.RawData) => this.handleMessage(raw));

    ws.on('close', () => {
      console.warn('[finnhub-ws] closed');
      this.scheduleReconnect();
    });

    ws.on('error', (err) => {
      console.error('[finnhub-ws] error:', err.message);
      // 'close' will follow and trigger the reconnect.
    });
  }

  private handleMessage(raw: WebSocket.RawData): void {
    let msg: FinnhubTradeMessage;
    try {
      msg = JSON.parse(raw.toString()) as FinnhubTradeMessage;
    } catch {
      return;
    }
    if (msg.type !== 'trade' || !msg.data) return;

    for (const t of msg.data) {
      const trade: Trade = { symbol: t.s, price: t.p, timestamp: t.t };
      for (const listener of this.listeners) listener(trade);
    }
  }

  private send(payload: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
    // If not open yet, desired-set replay on 'open' covers subscriptions.
  }

  private scheduleReconnect(): void {
    if (!this.started || this.reconnecting) return;
    this.reconnecting = true;
    const delay = this.reconnectDelay;
    setTimeout(() => {
      this.reconnecting = false;
      if (!this.started) return;
      console.log(`[finnhub-ws] reconnecting (delay ${delay}ms)…`);
      this.connect();
    }, delay).unref();
    // Exponential backoff capped at 30s.
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }
}

export const finnhubSocket = new FinnhubSocket();
