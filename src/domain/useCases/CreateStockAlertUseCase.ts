// src/domain/useCases/CreateStockAlertUseCase.ts
//
// One business action: create a stock price alert. Depends only on the
// StockAlertRepository contract.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { StockAlert } from '@/domain/entities/StockAlert';

import type { StockAlertRepository } from '@/domain/repositories/StockAlertRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class CreateStockAlertUseCase implements UseCase<
  StockAlert,
  StockAlert
> {
  constructor(
    @inject(TYPES.StockAlertRepository)
    private readonly stockAlertRepository: StockAlertRepository,
  ) {}

  run(alert: StockAlert): Promise<StockAlert> {
    return this.stockAlertRepository.createAlert(alert);
  }
}
