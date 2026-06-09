// src/domain/useCases/GetStockAlertsUseCase.ts
//
// One business action: list the user's stock price alerts. Depends only on the
// StockAlertRepository contract.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { StockAlert } from '@/domain/entities/StockAlert';

import type { StockAlertRepository } from '@/domain/repositories/StockAlertRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class GetStockAlertsUseCase implements UseCase<void, StockAlert[]> {
  constructor(
    @inject(TYPES.StockAlertRepository)
    private readonly stockAlertRepository: StockAlertRepository,
  ) {}

  run(): Promise<StockAlert[]> {
    return this.stockAlertRepository.getAlerts();
  }
}
