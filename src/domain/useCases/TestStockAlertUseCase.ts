// src/domain/useCases/TestStockAlertUseCase.ts
//
// One business action: fire a test push notification for an existing alert.
// Depends only on the StockAlertRepository contract.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { AlertTestResult } from '@/domain/entities/AlertTestResult';

import type { StockAlertRepository } from '@/domain/repositories/StockAlertRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class TestStockAlertUseCase implements UseCase<string, AlertTestResult> {
  constructor(
    @inject(TYPES.StockAlertRepository)
    private readonly stockAlertRepository: StockAlertRepository,
  ) {}

  run(id: string): Promise<AlertTestResult> {
    return this.stockAlertRepository.testAlert(id);
  }
}
