// src/domain/useCases/DeleteStockAlertUseCase.ts
//
// One business action: delete a stock price alert by id. Depends only on the
// StockAlertRepository contract.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import type { StockAlertRepository } from '@/domain/repositories/StockAlertRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class DeleteStockAlertUseCase implements UseCase<string, void> {
  constructor(
    @inject(TYPES.StockAlertRepository)
    private readonly stockAlertRepository: StockAlertRepository,
  ) {}

  run(id: string): Promise<void> {
    return this.stockAlertRepository.deleteAlert(id);
  }
}
