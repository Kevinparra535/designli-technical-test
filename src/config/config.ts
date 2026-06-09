// src/config/config.ts
//
// Runtime configuration. In Expo, ONLY env vars prefixed with `EXPO_PUBLIC_`
// are inlined into the app bundle (process.env.EXPO_PUBLIC_*). Plain
// process.env.X is undefined on device — hence every key below is EXPO_PUBLIC_.
// Define them in `.env` (gitignored).

export const config = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
  FINNHUB_BASE_URL:
    process.env.EXPO_PUBLIC_FINNHUB_BASE_URL || 'https://finnhub.io/api/v1',
  FINNHUB_SOCKET_URL:
    process.env.EXPO_PUBLIC_FINNHUB_SOCKET_URL || 'wss://ws.finnhub.io',
  FINNHUB_API_KEY: process.env.EXPO_PUBLIC_FINNHUB_API_KEY || '',
  WEBHOOK_BASE_URL:
    process.env.EXPO_PUBLIC_WEBHOOK_BASE_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'https://api.example.com',
  WEBHOOK_API_KEY: process.env.EXPO_PUBLIC_WEBHOOK_API_KEY || '',

  // The user's own Node backend (device-token registration, alert evaluation,
  // FCM push). Point EXPO_PUBLIC_BACKEND_BASE_URL at it (e.g. http://<lan-ip>:3000).
  BACKEND_BASE_URL:
    process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3000',

  API_ROUTES: {
    AUTH_LOGIN: '/auth/login',
    AUTH_ME: '/auth/me',
    STOCK_SYMBOLS: '/stock/symbol',
    STOCK_QUOTE: '/stock/quote',
    COMPANY_PROFILE: '/stock/profile2',
    STOCK_CANDLES: '/stock/candle',
    COMPANY_NEWS: '/company-news',
    WEBHOOKS: '/webhooks',
    DEVICES: '/devices',
  },
};
