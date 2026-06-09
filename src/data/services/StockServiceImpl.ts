// src/data/services/StockServiceImpl.ts
//
// Service implementation: talks to the FinnhubManager (infra) and maps the raw
// DTOs into domain entities via StockModel.toDomain(). This is the single point
// where data crosses into the domain — the repository above only delegates.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { Stock } from '@/domain/entities/Stock';
import type { StockDetail } from '@/domain/entities/StockDetail';

import type { StockService } from '@/domain/services/StockService';

import { FinnhubManager } from '@/data/network/finnhubManager';

import { CompanyProfileModel } from '@/data/models/CompanyProfileModel';
import { StockModel } from '@/data/models/StockModel';
import { StockQuoteModel } from '@/data/models/StockQuoteModel';

@injectable()
export class StockServiceImpl implements StockService {
  constructor(
    @inject(TYPES.FinnhubManager)
    private readonly service: FinnhubManager,
  ) {}

  async getStockList(exchange: string = 'US'): Promise<Stock[]> {
    const items = await this.service.getStockSymbols(exchange);
    return StockModel.fromJsonList(items).map((model) => model.toDomain());
  }

  async getStockDetail(symbol: string): Promise<StockDetail> {
    const [quote, profile] = await Promise.all([
      this.service.getQuote(symbol),
      this.service.getCompanyProfile(symbol),
    ]);
    return {
      symbol,
      quote: StockQuoteModel.fromJson(quote).toDomain(),
      profile: CompanyProfileModel.fromJson(profile).toDomain(),
    };
  }
}
