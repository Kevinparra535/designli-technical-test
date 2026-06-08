// src/domain/useCases/GetStockListUseCase.ts
//
// One business action: fetch the list of stocks. Depends only on the
// StockRepository contract (injected), never on the data implementation.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { Stock } from '@/domain/entities/Stock';

import type { StockRepository } from '@/domain/repositories/StockRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class GetStockListUseCase implements UseCase<void, Stock[]> {
  constructor(
    @inject(TYPES.StockRepository)
    private readonly stockRepository: StockRepository,
  ) {}

  run(): Promise<Stock[]> {
    return this.stockRepository.getStockList();
  }
}
