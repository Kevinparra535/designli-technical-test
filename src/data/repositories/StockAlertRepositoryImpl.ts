// src/data/repositories/StockAlertRepositoryImpl.ts
//
// Repository impl: delegates to the StockAlertService (which owns the webhook
// wiring + DTO→domain mapping). Passthrough by design.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { StockAlert } from '@/domain/entities/StockAlert';

import type { StockAlertRepository } from '@/domain/repositories/StockAlertRepository';
import type { StockAlertService } from '@/domain/services/StockAlertService';

@injectable()
export class StockAlertRepositoryImpl implements StockAlertRepository {
  constructor(
    @inject(TYPES.StockAlertService)
    private readonly service: StockAlertService,
  ) {}

  createAlert(alert: StockAlert): Promise<StockAlert> {
    return this.service.createAlert(alert);
  }
}
