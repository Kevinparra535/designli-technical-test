// src/domain/repositories/StockRepository.ts
//
// Domain contract for stock data. Expressed purely in terms of the Stock
// entity — no DTOs, no framework types. The implementation lives in
// `src/data/repositories/StockRepositoryImpl.ts`.

import { Stock } from '@/domain/entities/Stock';
import { StockDetail } from '@/domain/entities/StockDetail';

export interface StockRepository {
  /** Full list of tradable symbols for an exchange (defaults to "US"). */
  getStockList(exchange?: string): Promise<Stock[]>;
  /** Quote + company profile for a single symbol. */
  getStockDetail(symbol: string): Promise<StockDetail>;
}
