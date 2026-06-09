// src/data/models/StockQuoteModel.ts
//
// DTO for Finnhub's /quote payload ({ c, h, l, o, pc, t }). Computes change and
// percent-change on the way into the domain.

import { StockQuote } from '@/domain/entities/StockQuote';

export type StockQuoteJson = {
  c: number; // current
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // unix timestamp (seconds)
};

export class StockQuoteModel {
  readonly c: number;
  readonly h: number;
  readonly l: number;
  readonly o: number;
  readonly pc: number;
  readonly t: number;

  constructor(json: StockQuoteJson) {
    this.c = json.c ?? 0;
    this.h = json.h ?? 0;
    this.l = json.l ?? 0;
    this.o = json.o ?? 0;
    this.pc = json.pc ?? 0;
    this.t = json.t ?? 0;
  }

  static fromJson(json: StockQuoteJson): StockQuoteModel {
    return new StockQuoteModel(json);
  }

  toDomain(): StockQuote {
    const change = this.c - this.pc;
    const percentChange = this.pc > 0 ? (change / this.pc) * 100 : 0;
    return new StockQuote({
      current: this.c,
      change,
      percentChange,
      high: this.h,
      low: this.l,
      open: this.o,
      previousClose: this.pc,
      timestamp: this.t * 1000,
      error: null,
    });
  }
}
