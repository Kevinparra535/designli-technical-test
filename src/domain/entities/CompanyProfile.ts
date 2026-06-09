// src/domain/entities/CompanyProfile.ts
//
// Company profile for a stock (Finnhub /stock/profile2). Pure data class.
// Crypto / non-equity symbols may return mostly empty fields.

export interface ConstructorParams {
  name: string;
  ticker: string;
  exchange: string;
  currency: string;
  country: string;
  marketCapitalization: number;
  shareOutstanding: number;
  ipo: string;
  weburl: string;
  logo?: string;
  error?: string | null;
  [key: string]: any;
}

export class CompanyProfile {
  public name: ConstructorParams['name'];
  public ticker: ConstructorParams['ticker'];
  public exchange: ConstructorParams['exchange'];
  public currency: ConstructorParams['currency'];
  public country: ConstructorParams['country'];
  public marketCapitalization: ConstructorParams['marketCapitalization'];
  public shareOutstanding: ConstructorParams['shareOutstanding'];
  public ipo: ConstructorParams['ipo'];
  public weburl: ConstructorParams['weburl'];
  public logo?: ConstructorParams['logo'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.name = model.name;
    this.ticker = model.ticker;
    this.exchange = model.exchange;
    this.currency = model.currency;
    this.country = model.country;
    this.marketCapitalization = model.marketCapitalization;
    this.shareOutstanding = model.shareOutstanding;
    this.ipo = model.ipo;
    this.weburl = model.weburl;
    this.logo = model.logo;
    this.error = model.error;
  }
}
