// src/modules/prices/prices.gateway.ts
//
// Transport adapter: a WebSocket server (path = env.WS_PATH) that app clients
// connect to. It translates the wire protocol into PriceHub calls and adapts
// each raw `ws` connection into the hub's transport-agnostic StreamClient.
//
// Client → server messages (JSON):
//   { "type": "subscribe",   "symbols": ["AAPL", "MSFT"] }
//   { "type": "unsubscribe", "symbols": ["AAPL"] }
//   { "type": "ping" }
//
// Server → client messages (JSON):
//   { "type": "welcome",  "path": "/ws" }
//   { "type": "snapshot", "data": [{ symbol, price, t }] }   // last known prices
//   { "type": "prices",   "data": [{ symbol, price, t }] }   // coalesced ticks
//   { "type": "pong" }

import type { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';

import { env } from '../../config/env';

import { priceHub, type StreamClient } from './priceHub';

interface ClientMessage {
  type?: string;
  symbols?: unknown;
}

function asSymbolArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((s): s is string => typeof s === 'string');
}

export function attachPriceGateway(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: env.WS_PATH });

  wss.on('connection', (ws: WebSocket) => {
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
          priceHub.subscribe(client, asSymbolArray(msg.symbols));
          break;
        case 'unsubscribe':
          priceHub.unsubscribe(client, asSymbolArray(msg.symbols));
          break;
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
