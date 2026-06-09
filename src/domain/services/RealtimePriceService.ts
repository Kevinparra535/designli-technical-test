// src/domain/services/RealtimePriceService.ts
//
// Domain contract for real-time prices. Subscribing returns a teardown function
// that stops the subscription. Expressed in terms of the Trade entity.

import { Trade } from '@/domain/entities/Trade';

export interface RealtimePriceService {
  subscribe(symbols: string[], onTrade: (trade: Trade) => void): () => void;
}
