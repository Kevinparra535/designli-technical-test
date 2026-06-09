// src/data/services/RealtimePriceServiceImpl.ts
//
// Service impl: drives the FinnhubSocketManager and maps each raw trade DTO into
// a Trade domain entity before handing it to the caller. Returns a teardown that
// unsubscribes the symbols and detaches the listener.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { Trade } from '@/domain/entities/Trade';

import type { RealtimePriceService } from '@/domain/services/RealtimePriceService';

import type { FinnhubSocketManager } from '@/data/network/finnhubSocketManager';

import { TradeModel } from '@/data/models/TradeModel';

@injectable()
export class RealtimePriceServiceImpl implements RealtimePriceService {
  constructor(
    @inject(TYPES.FinnhubSocketManager)
    private readonly service: FinnhubSocketManager,
  ) {}

  subscribe(symbols: string[], onTrade: (trade: Trade) => void): () => void {
    this.service.connect();

    const detach = this.service.onTrade((dtos) => {
      dtos.forEach((dto) => onTrade(TradeModel.fromJson(dto).toDomain()));
    });
    symbols.forEach((symbol) => this.service.subscribe(symbol));

    return () => {
      symbols.forEach((symbol) => this.service.unsubscribe(symbol));
      detach();
    };
  }
}
