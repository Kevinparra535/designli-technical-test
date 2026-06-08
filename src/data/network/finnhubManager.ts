import { inject, injectable } from 'inversify';
import qs from 'qs';

import { config } from '@/config/config';
import { TYPES } from '@/config/types';

import { HttpManager } from '@/data/network/axiosManager';

import Logger from '@/ui/utils/Logger';

export interface FinnhubQuote {
  c: number; // Current price
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface FinnhubSymbolSearchItem {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface FinnhubCandles {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string; // Status
  t: number[]; // Timestamps
  v: number[]; // Volume data
}

export interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubManager {
  searchSymbol(query: string): Promise<FinnhubSymbolSearchItem[]>;
  getQuote(symbol: string): Promise<FinnhubQuote>;
  getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile>;
  getStockCandles(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
  ): Promise<FinnhubCandles>;
  getCompanyNews(
    symbol: string,
    from: string,
    to: string,
  ): Promise<FinnhubNewsItem[]>;
}

@injectable()
export class FinnhubManagerImpl implements FinnhubManager {
  private readonly baseUrl = config.FINNHUB_BASE_URL;
  private readonly apiKey = config.FINNHUB_API_KEY;
  private readonly logger = new Logger('FinnhubManager');

  constructor(@inject(TYPES.HttpManager) private readonly http: HttpManager) {}

  private buildUrl(
    path: string,
    params: Record<string, string | number | boolean> = {},
  ): string {
    if (!this.apiKey) {
      const error = new Error(
        'Finnhub API key is not configured. Set FINNHUB_API_KEY in environment variables.',
      );
      this.logger.error(error.message);
      throw error;
    }

    const query = qs.stringify(
      { token: this.apiKey, ...params },
      { addQueryPrefix: true, encode: false },
    );
    return `${this.baseUrl}${path}${query}`;
  }

  async searchSymbol(query: string): Promise<FinnhubSymbolSearchItem[]> {
    const url = this.buildUrl('/search', { q: query });
    return this.http
      .get<{ count: number; result: FinnhubSymbolSearchItem[] }>(url)
      .then((response) => response.result);
  }

  async getQuote(symbol: string): Promise<FinnhubQuote> {
    const url = this.buildUrl('/quote', { symbol });
    return this.http.get<FinnhubQuote>(url);
  }

  async getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile> {
    const url = this.buildUrl('/stock/profile2', { symbol });
    return this.http.get<FinnhubCompanyProfile>(url);
  }

  async getStockCandles(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
  ): Promise<FinnhubCandles> {
    const url = this.buildUrl('/stock/candle', {
      symbol,
      resolution,
      from,
      to,
    });
    return this.http.get<FinnhubCandles>(url);
  }

  async getCompanyNews(
    symbol: string,
    from: string,
    to: string,
  ): Promise<FinnhubNewsItem[]> {
    const url = this.buildUrl('/company-news', { symbol, from, to });
    return this.http.get<FinnhubNewsItem[]>(url);
  }
}
