// src/domain/useCases/GetStockDetailUseCase.ts
//
// One business action: load the detail (quote + profile) for a symbol.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import type { StockDetail } from '@/domain/entities/StockDetail';

import type { StockRepository } from '@/domain/repositories/StockRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class GetStockDetailUseCase implements UseCase<string, StockDetail> {
  constructor(
    @inject(TYPES.StockRepository)
    private readonly stockRepository: StockRepository,
  ) {}

  run(symbol: string): Promise<StockDetail> {
    return this.stockRepository.getStockDetail(symbol);
  }
}
