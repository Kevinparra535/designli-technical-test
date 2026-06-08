// src/domain/entities/Stock.ts
//
// Stock domain entity — a tradable instrument as returned by Finnhub's
// symbol-search (`/search`) and stock-symbols (`/stock/symbol`) endpoints, once
// mapped into the domain. Pure data class: no framework/infra imports, no
// behaviour — the data layer fills it via StockModel.toDomain().

export interface ConstructorParams {
  /** Unique Finnhub symbol used in API calls, e.g. "AAPL". */
  symbol: string;
  /** Human-facing ticker, e.g. "AAPL" (can differ from `symbol` on some venues). */
  displaySymbol: string;
  /** Company / instrument description, e.g. "APPLE INC". */
  description: string;
  /** Instrument type, e.g. "Common Stock", "ETP", "ADR". */
  type: string;
  /** Trading currency (only present on `/stock/symbol`), e.g. "USD". */
  currency?: string;
  /** Market Identifier Code of the exchange (ISO 10383), e.g. "XNAS". */
  mic?: string;
  /** Financial Instrument Global Identifier. */
  figi?: string;
  /** Per-entity error slot (kept consistent across domain entities). */
  error?: string | null;
  [key: string]: any;
}

export class Stock {
  public symbol: ConstructorParams['symbol'];
  public displaySymbol: ConstructorParams['displaySymbol'];
  public description: ConstructorParams['description'];
  public type: ConstructorParams['type'];
  public currency?: ConstructorParams['currency'];
  public mic?: ConstructorParams['mic'];
  public figi?: ConstructorParams['figi'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.symbol = model.symbol;
    this.displaySymbol = model.displaySymbol;
    this.description = model.description;
    this.type = model.type;
    this.currency = model.currency;
    this.mic = model.mic;
    this.figi = model.figi;
    this.error = model.error;
  }
}
