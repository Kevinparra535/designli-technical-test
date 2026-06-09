// src/data/models/TradeModel.ts
//
// Transport model (DTO) for a Finnhub websocket trade item:
//   { s: symbol, p: price, t: epoch-ms, v: volume }
// Owns the DTO→domain mapping.

import { Trade } from '@/domain/entities/Trade';

export type TradeJson = {
  s: string;
  p: number;
  t: number;
  v: number;
};

export class TradeModel {
  readonly s: string;
  readonly p: number;
  readonly t: number;
  readonly v: number;

  constructor(json: TradeJson) {
    this.s = json.s;
    this.p = json.p;
    this.t = json.t;
    this.v = json.v;
  }

  static fromJson(json: TradeJson): TradeModel {
    return new TradeModel(json);
  }

  toDomain(): Trade {
    return new Trade({
      symbol: this.s,
      price: this.p,
      timestamp: this.t,
      volume: this.v,
      error: null,
    });
  }
}
