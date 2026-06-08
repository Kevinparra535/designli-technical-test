// src/data/models/StockAlertModel.ts
//
// Transport model (DTO) for a stock price alert stored as a generic webhook
// registration. The alert details (symbol / condition / price) are encoded into
// the webhook `event` string; this model owns both the encode (request) and the
// decode→domain (response) so the mapping lives in one place.

import { type AlertCondition, StockAlert } from '@/domain/entities/StockAlert';

export const STOCK_ALERT_EVENT_PREFIX = 'stock-price-alert';

export type StockAlertModelJson = {
  id: string;
  event: string;
  active: boolean;
  createdAt: string;
};

export class StockAlertModel {
  readonly id: string;
  readonly event: string;
  readonly active: boolean;
  readonly createdAt: string;

  constructor(json: StockAlertModelJson) {
    this.id = json.id;
    this.event = json.event;
    this.active = json.active;
    this.createdAt = json.createdAt;
  }

  static fromJson(json: StockAlertModelJson): StockAlertModel {
    return new StockAlertModel(json);
  }

  /** Encode an alert into the webhook `event` string the backend stores. */
  static encodeEvent(
    symbol: string,
    condition: AlertCondition,
    targetPrice: number,
  ): string {
    return `${STOCK_ALERT_EVENT_PREFIX}:${symbol}:${condition}:${targetPrice}`;
  }

  toDomain(): StockAlert {
    const [, symbol = '', condition = 'above', price = '0'] =
      this.event.split(':');
    return new StockAlert({
      id: this.id,
      symbol,
      condition: condition as AlertCondition,
      targetPrice: Number(price) || 0,
      active: this.active,
      createdAt: this.createdAt ?? null,
      error: null,
    });
  }
}
