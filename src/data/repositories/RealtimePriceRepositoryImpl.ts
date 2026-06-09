// src/data/repositories/RealtimePriceRepositoryImpl.ts
//
// Repository impl: delegates to the RealtimePriceService (which owns the socket
// + DTO→domain mapping). Passthrough by design.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { Trade } from '@/domain/entities/Trade';

import type { RealtimePriceRepository } from '@/domain/repositories/RealtimePriceRepository';
import type { RealtimePriceService } from '@/domain/services/RealtimePriceService';

@injectable()
export class RealtimePriceRepositoryImpl implements RealtimePriceRepository {
  constructor(
    @inject(TYPES.RealtimePriceService)
    private readonly service: RealtimePriceService,
  ) {}

  subscribe(symbols: string[], onTrade: (trade: Trade) => void): () => void {
    return this.service.subscribe(symbols, onTrade);
  }
}
