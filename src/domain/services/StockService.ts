// src/domain/services/StockService.ts
//
// Domain contract for the stock data source. The service is the layer that
// knows the provider (Finnhub) and turns its raw payloads into domain entities.
// The repository depends on this contract; the data-layer impl wires the
// manager. Expressed purely in terms of the Stock entity — no DTOs, no infra.

import { Stock } from '@/domain/entities/Stock';

export interface StockService {
  getStockList(exchange?: string): Promise<Stock[]>;
}
