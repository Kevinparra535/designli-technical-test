// src/data/models/StockModel.ts
//
// Transport model (DTO) for a stock symbol as returned by Finnhub's `/search`
// and `/stock/symbol` endpoints. It mirrors the backend payload shape; the
// single crossing point into the domain is `toDomain()` — the repository never
// hands a raw model to the upper layers.
//
// The JSON shape is structurally compatible with the manager's
// `FinnhubSymbolSearchItem`, so a search result can be fed straight in:
//   StockModel.fromJsonList(await finnhub.searchSymbol(q)).map((m) => m.toDomain())

import { Stock } from '@/domain/entities/Stock';

export type StockModelJson = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
  currency?: string;
  mic?: string;
  figi?: string;
  // Finnhub may return extra fields (symbol2, isin, shareClassFIGI, …).
  [key: string]: unknown;
};

export class StockModel {
  readonly symbol: string;
  readonly displaySymbol: string;
  readonly description: string;
  readonly type: string;
  readonly currency?: string;
  readonly mic?: string;
  readonly figi?: string;

  constructor(json: StockModelJson) {
    this.symbol = json.symbol;
    this.displaySymbol = json.displaySymbol;
    this.description = json.description;
    this.type = json.type;
    this.currency = json.currency;
    this.mic = json.mic;
    this.figi = json.figi;
  }

  static fromJson(json: StockModelJson): StockModel {
    return new StockModel(json);
  }

  static fromJsonList(list: StockModelJson[] | null | undefined): StockModel[] {
    return (list ?? []).map((json) => StockModel.fromJson(json));
  }

  /** Map the DTO into the domain entity. Renames/normalizes happen here. */
  toDomain(): Stock {
    return new Stock({
      symbol: this.symbol,
      displaySymbol: this.displaySymbol || this.symbol,
      description: this.description ?? '',
      type: this.type ?? '',
      currency: this.currency,
      mic: this.mic,
      figi: this.figi,
    });
  }
}
