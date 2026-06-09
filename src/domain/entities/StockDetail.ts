// src/domain/entities/StockDetail.ts
//
// Read-model aggregate for the stock detail screen: the symbol plus its live
// quote and company profile. Composed of domain entities; no framework imports.

import { CompanyProfile } from '@/domain/entities/CompanyProfile';
import { StockQuote } from '@/domain/entities/StockQuote';

export interface StockDetail {
  symbol: string;
  quote: StockQuote;
  profile: CompanyProfile;
}
