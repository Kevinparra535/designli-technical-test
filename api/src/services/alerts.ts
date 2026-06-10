// src/services/alerts.ts
//
// Encoding/decoding of the stock alert that the Expo app stores inside a
// webhook's `event` string. Must stay in sync with the app's StockAlertModel:
//   stock-price-alert:<SYMBOL>:<above|below>:<targetPrice>

export type AlertCondition = 'above' | 'below';

export const STOCK_ALERT_EVENT_PREFIX = 'stock-price-alert';

export interface DecodedAlert {
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
}

/** Parse an event string. Returns null if it is not a stock-price-alert event. */
export function decodeAlertEvent(event: string): DecodedAlert | null {
  const parts = event.split(':');
  if (parts[0] !== STOCK_ALERT_EVENT_PREFIX) return null;

  const symbol = parts[1] ?? '';
  const condition = (parts[2] as AlertCondition) ?? 'above';
  const targetPrice = Number(parts[3] ?? '0') || 0;

  if (!symbol || (condition !== 'above' && condition !== 'below')) return null;
  return { symbol, condition, targetPrice };
}

/** True when the current price has crossed the alert's threshold. */
export function isCrossed(alert: DecodedAlert, currentPrice: number): boolean {
  return alert.condition === 'above'
    ? currentPrice > alert.targetPrice
    : currentPrice < alert.targetPrice;
}
