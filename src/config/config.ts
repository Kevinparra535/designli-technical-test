export const config = {
  BASE_URL: process.env.API_BASE_URL || 'https://api.example.com',
  FINNHUB_BASE_URL: process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1',
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || '',
  WEBHOOK_BASE_URL:
    process.env.WEBHOOK_BASE_URL ||
    process.env.API_BASE_URL ||
    'https://api.example.com',
  WEBHOOK_API_KEY: process.env.WEBHOOK_API_KEY || '',

  API_ROUTES: {
    STOCK_QUOTE: '/stock/quote',
    COMPANY_PROFILE: '/stock/profile2',
    STOCK_CANDLES: '/stock/candle',
    COMPANY_NEWS: '/company-news',
    WEBHOOKS: '/webhooks',
  },
};
