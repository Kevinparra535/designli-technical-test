// src/ui/utils/format.ts
//
// Shared presentation formatters. Keep screens free of ad-hoc number/string
// formatting so the visual components stay declarative.

/** US-dollar amount, e.g. fmtUsd(1234.5) → "$1,234.50", fmtUsd(300, 0) → "$300". */
export const fmtUsd = (value: number, decimals = 2): string =>
  '$' +
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** Signed dollar delta, e.g. "+$1.95" / "−$5.24". */
export const fmtSigned = (value: number): string =>
  (value >= 0 ? '+' : '−') + '$' + Math.abs(value).toFixed(2);

/** Signed percentage, e.g. "+3.42%" / "−2.13%". */
export const fmtPct = (value: number): string =>
  (value >= 0 ? '+' : '−') + Math.abs(value).toFixed(2) + '%';

/** Short localized date from an ISO string ("12 jun"); "" when missing/invalid. */
export const fmtDate = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
};

/** Human ticker from a Finnhub symbol, e.g. "BINANCE:BTCUSDT" → "BTC". */
export const displaySymbol = (symbol: string): string =>
  symbol.includes(':')
    ? (symbol.split(':')[1] ?? symbol).replace('USDT', '')
    : symbol;

/** Two-letter monogram for an account avatar, e.g. "kevin@x.com" → "KE". */
export const accountInitials = (email?: string): string => {
  const local = email ? email.split('@')[0] : '';
  return (local.slice(0, 2) || '?').toUpperCase();
};

/** Display name derived from an email local-part, e.g. "kevin@x.com" → "Kevin". */
export const accountName = (email?: string): string => {
  const local = email ? email.split('@')[0] : '';
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'Tu cuenta';
};
