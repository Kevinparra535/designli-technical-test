// src/data/models/CompanyProfileModel.ts
//
// DTO for Finnhub's /stock/profile2 payload. Maps into the CompanyProfile
// domain entity, defaulting missing fields (crypto/non-equity return sparse).

import { CompanyProfile } from '@/domain/entities/CompanyProfile';

export type CompanyProfileJson = {
  name?: string;
  ticker?: string;
  exchange?: string;
  currency?: string;
  country?: string;
  marketCapitalization?: number;
  shareOutstanding?: number;
  ipo?: string;
  weburl?: string;
  logo?: string;
};

export class CompanyProfileModel {
  constructor(private readonly json: CompanyProfileJson) {}

  static fromJson(json: CompanyProfileJson): CompanyProfileModel {
    return new CompanyProfileModel(json ?? {});
  }

  toDomain(): CompanyProfile {
    return new CompanyProfile({
      name: this.json.name ?? '',
      ticker: this.json.ticker ?? '',
      exchange: this.json.exchange ?? '',
      currency: this.json.currency ?? '',
      country: this.json.country ?? '',
      marketCapitalization: this.json.marketCapitalization ?? 0,
      shareOutstanding: this.json.shareOutstanding ?? 0,
      ipo: this.json.ipo ?? '',
      weburl: this.json.weburl ?? '',
      logo: this.json.logo,
      error: null,
    });
  }
}
