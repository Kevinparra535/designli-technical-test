// src/domain/entities/StockQuote.ts
//
// A point-in-time quote for a stock (Finnhub /quote). Pure data class.

export interface ConstructorParams {
  current: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
  error?: string | null;
  [key: string]: any;
}

export class StockQuote {
  public current: ConstructorParams['current'];
  public change: ConstructorParams['change'];
  public percentChange: ConstructorParams['percentChange'];
  public high: ConstructorParams['high'];
  public low: ConstructorParams['low'];
  public open: ConstructorParams['open'];
  public previousClose: ConstructorParams['previousClose'];
  public timestamp: ConstructorParams['timestamp'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.current = model.current;
    this.change = model.change;
    this.percentChange = model.percentChange;
    this.high = model.high;
    this.low = model.low;
    this.open = model.open;
    this.previousClose = model.previousClose;
    this.timestamp = model.timestamp;
    this.error = model.error;
  }
}
