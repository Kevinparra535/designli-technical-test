// src/domain/repositories/RealtimePriceRepository.ts
//
// Domain contract the SubscribeToPricesUseCase depends on. The impl delegates to
// the RealtimePriceService.

import { Trade } from '@/domain/entities/Trade';

export interface RealtimePriceRepository {
  subscribe(symbols: string[], onTrade: (trade: Trade) => void): () => void;
}
