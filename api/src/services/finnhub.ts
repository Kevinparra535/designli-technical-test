// src/services/finnhub.ts
//
// Server-side Finnhub client used by the alert worker to poll live quotes.
// Uses the backend's own FINNHUB_API_KEY (kept off the device).

import axios, { type AxiosInstance } from 'axios';

import { env } from '../config/env';

export interface FinnhubQuote {
  c: number; // current price
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // unix timestamp
}

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!client) {
    client = axios.create({ baseURL: env.FINNHUB_BASE_URL, timeout: 10000 });
  }
  return client;
}

/** Latest quote for a symbol. Throws if FINNHUB_API_KEY is not configured. */
export async function getQuote(symbol: string): Promise<FinnhubQuote> {
  if (!env.FINNHUB_API_KEY) {
    throw new Error(
      'FINNHUB_API_KEY is not configured — cannot poll quotes for alerts.',
    );
  }
  const { data } = await getClient().get<FinnhubQuote>('/quote', {
    params: { symbol, token: env.FINNHUB_API_KEY },
  });
  return data;
}

export function isFinnhubConfigured(): boolean {
  return Boolean(env.FINNHUB_API_KEY);
}
