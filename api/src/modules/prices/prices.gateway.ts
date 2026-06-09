// src/modules/prices/prices.gateway.ts
//
// Transport adapter: a WebSocket server (path = env.WS_PATH) that app clients
// connect to. It translates the wire protocol into PriceHub calls and adapts
// each raw `ws` connection into the hub's transport-agnostic StreamClient.
//
// Client → server messages (JSON):
//   { "type": "subscribe",   "symbols": ["AAPL", "MSFT"], "throttleMs": 1000 }
//   { "type": "unsubscribe", "symbols": ["AAPL"] }
//   { "type": "throttle",    "throttleMs": 1000 }   // change cadence only
//   { "type": "ping" }
//
// `throttleMs` is optional and per-client (clamped 100–10000 ms); it sets how
// often THIS client receives coalesced `prices` updates.
//
// Server → client messages (JSON):
//   { "type": "welcome",  "path": "/ws" }
//   { "type": "snapshot", "data": [{ symbol, price, t }] }   // last known prices
//   { "type": "prices",   "data": [{ symbol, price, t }] }   // coalesced ticks
//   { "type": "throttle", "throttleMs": 1000 }               // ack (clamped)
//   { "type": "pong" }

import type { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';

import { env } from '../../config/env';

import { priceHub, type StreamClient } from './priceHub';

interface ClientMessage {
  type?: string;
  symbols?: unknown;
  throttleMs?: unknown;
}

function asSymbolArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((s): s is string => typeof s === 'string');
}

function asThrottle(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

// Heartbeat: ping clients periodically and drop dead ones. Required on hosts
// like Heroku that close idle WebSocket connections after ~55s.
const HEARTBEAT_MS = 30000;

export function attachPriceGateway(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: env.WS_PATH });

  const alive = new WeakMap<WebSocket, { ok: boolean }>();
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      const state = alive.get(ws);
      if (state && !state.ok) {
        ws.terminate(); // missed the previous ping → connection is dead
        continue;
      }
      if (state) state.ok = false;
      ws.ping();
    }
  }, HEARTBEAT_MS);
  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', (ws: WebSocket) => {
    alive.set(ws, { ok: true });
    ws.on('pong', () => {
      const state = alive.get(ws);
      if (state) state.ok = true;
    });

    // Adapt the raw socket into the hub's StreamClient.
    const client: StreamClient = {
      subscriptions: new Set<string>(),
      send: (message: unknown) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
      },
    };

    priceHub.addClient(client);
    client.send({ type: 'welcome', path: env.WS_PATH });

    ws.on('message', (raw) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(raw.toString()) as ClientMessage;
      } catch {
        return;
      }
      switch (msg.type) {
        case 'subscribe':
          priceHub.subscribe(
            client,
            asSymbolArray(msg.symbols),
            asThrottle(msg.throttleMs),
          );
          break;
        case 'unsubscribe':
          priceHub.unsubscribe(client, asSymbolArray(msg.symbols));
          break;
        case 'throttle': {
          const ms = asThrottle(msg.throttleMs);
          if (ms !== undefined) priceHub.setThrottle(client, ms);
          break;
        }
        case 'ping':
          client.send({ type: 'pong' });
          break;
        default:
          break;
      }
    });

    ws.on('close', () => priceHub.removeClient(client));
    ws.on('error', () => priceHub.removeClient(client));
  });

  console.log(`[gateway] price WebSocket listening on path ${env.WS_PATH}`);
  return wss;
}
