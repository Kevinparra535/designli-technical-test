// src/data/repositories/StockRepositoryImpl.ts
//
// Repository implementation: delegates to the StockService (which owns the
// provider + DTO→domain mapping) and returns domain entities. Passthrough by
// design — keeps the UseCase depending on a stable domain contract while the
// service handles the infrastructure details.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { Stock } from '@/domain/entities/Stock';
import type { StockDetail } from '@/domain/entities/StockDetail';

import type { StockRepository } from '@/domain/repositories/StockRepository';
import type { StockService } from '@/domain/services/StockService';

@injectable()
export class StockRepositoryImpl implements StockRepository {
  constructor(
    @inject(TYPES.StockService)
    private readonly service: StockService,
  ) {}

  getStockList(exchange?: string): Promise<Stock[]> {
    return this.service.getStockList(exchange);
  }

  getStockDetail(symbol: string): Promise<StockDetail> {
    return this.service.getStockDetail(symbol);
  }
}
