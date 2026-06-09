// src/domain/entities/Trade.ts
//
// A single real-time trade tick from Finnhub's websocket (`type: "trade"`).
// Pure data class, no framework imports.

export interface ConstructorParams {
  symbol: string;
  price: number;
  /** Epoch milliseconds of the trade. */
  timestamp: number;
  volume: number;
  error?: string | null;
  [key: string]: any;
}

export class Trade {
  public symbol: ConstructorParams['symbol'];
  public price: ConstructorParams['price'];
  public timestamp: ConstructorParams['timestamp'];
  public volume: ConstructorParams['volume'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.symbol = model.symbol;
    this.price = model.price;
    this.timestamp = model.timestamp;
    this.volume = model.volume;
    this.error = model.error;
  }
}
