import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { Stock } from '@/domain/entities/Stock';
import { Trade } from '@/domain/entities/Trade';

import { GetStockDetailUseCase } from '@/domain/useCases/GetStockDetailUseCase';
import { GetStockListUseCase } from '@/domain/useCases/GetStockListUseCase';
import { RegisterPushNotificationsUseCase } from '@/domain/useCases/RegisterPushNotificationsUseCase';
import { SubscribeToPricesUseCase } from '@/domain/useCases/SubscribeToPricesUseCase';

import Logger from '@/shared/Logger';

type ICalls = 'init';

const MAX_POINTS = 40;

// Watched symbols. Crypto (BINANCE:*) trades 24/7 so the demo stays live even
// when the US market is closed. `symbol` is the Finnhub/websocket id.
const WATCHLIST = [
  { symbol: 'AAPL', displaySymbol: 'AAPL', name: 'Apple Inc' },
  { symbol: 'MSFT', displaySymbol: 'MSFT', name: 'Microsoft Corp' },
  { symbol: 'NVDA', displaySymbol: 'NVDA', name: 'NVIDIA Corp' },
  { symbol: 'AMZN', displaySymbol: 'AMZN', name: 'Amazon.com Inc' },
  { symbol: 'TSLA', displaySymbol: 'TSLA', name: 'Tesla Inc' },
  { symbol: 'META', displaySymbol: 'META', name: 'Meta Platforms' },
  { symbol: 'GOOGL', displaySymbol: 'GOOGL', name: 'Alphabet Inc' },
  { symbol: 'AMD', displaySymbol: 'AMD', name: 'Adv. Micro Devices' },
  { symbol: 'COIN', displaySymbol: 'COIN', name: 'Coinbase Global' },
  { symbol: 'NFLX', displaySymbol: 'NFLX', name: 'Netflix Inc' },
  { symbol: 'BINANCE:BTCUSDT', displaySymbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'BINANCE:ETHUSDT', displaySymbol: 'ETH', name: 'Ethereum' },
];
const WATCH_SYMBOLS = WATCHLIST.map((w) => w.symbol);
const isCrypto = (symbol: string) => symbol.includes(':');

type QuoteSnap = { previousClose: number; open: number; current: number };

export type MarketRow = {
  symbol: string;
  displaySymbol: string;
  name: string;
  price: number;
  pct: number;
  history: number[];
};

@injectable()
export class HomeViewModel {
  isInitLoading = false;
  isInitError: string | null = null;
  stocks: Stock[] = [];

  /** Latest price per watched symbol (live from the websocket). */
  livePrices = new Map<string, number>();
  /** REST quote snapshot per stock (daily reference: prev close / open). */
  private quotes = new Map<string, QuoteSnap>();
  /** First price seen per symbol — % baseline when there's no REST quote. */
  private sessionBase = new Map<string, number>();
  /** Rolling per-symbol history that feeds each row's sparkline. */
  private priceHistory = new Map<string, number[]>();
  /** Rolling sum-of-watchlist history that feeds the header sparkline. */
  aggregateHistory: number[] = [];

  private logger = new Logger('HomeViewModel');
  private priceTeardown: (() => void) | null = null;

  constructor(
    @inject(TYPES.GetStockListUseCase)
    private readonly getStockListUseCase: GetStockListUseCase,
    @inject(TYPES.GetStockDetailUseCase)
    private readonly getStockDetailUseCase: GetStockDetailUseCase,
    @inject(TYPES.RegisterPushNotificationsUseCase)
    private readonly registerPushNotificationsUseCase: RegisterPushNotificationsUseCase,
    @inject(TYPES.SubscribeToPricesUseCase)
    private readonly subscribeToPricesUseCase: SubscribeToPricesUseCase,
  ) {
    makeAutoObservable(this);
  }

  // ── Computed ─────────────────────────────────────────────────────────────────

  get rows(): MarketRow[] {
    return WATCHLIST.map((w) => {
      const quote = this.quotes.get(w.symbol);
      const price = this.livePrices.get(w.symbol) ?? quote?.current ?? 0;
      let pct = 0;
      if (quote && quote.previousClose > 0) {
        pct = ((price - quote.previousClose) / quote.previousClose) * 100;
      } else {
        const base = this.sessionBase.get(w.symbol);
        pct = base && base > 0 ? ((price - base) / base) * 100 : 0;
      }
      return {
        symbol: w.symbol,
        displaySymbol: w.displaySymbol,
        name: w.name,
        price,
        pct,
        history: this.priceHistory.get(w.symbol) ?? [],
      };
    });
  }

  get movers(): MarketRow[] {
    return [...this.rows].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  }

  get totalValue(): number {
    return this.rows.reduce((sum, r) => sum + r.price, 0);
  }

  get totalPct(): number {
    let baseSum = 0;
    let curSum = 0;
    for (const w of WATCHLIST) {
      const quote = this.quotes.get(w.symbol);
      const price = this.livePrices.get(w.symbol) ?? quote?.current ?? 0;
      const base = quote?.previousClose ?? this.sessionBase.get(w.symbol) ?? 0;
      if (base > 0 && price > 0) {
        baseSum += base;
        curSum += price;
      }
    }
    return baseSum > 0 ? ((curSum - baseSum) / baseSum) * 100 : 0;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    this.updateLoadingState(true, null, 'init');
    try {
      const stocks = await this.getStockListUseCase.run();
      runInAction(() => {
        this.stocks = stocks;
      });
      this.logger.info(`Stock list fetched: ${stocks.length} symbols`);

      // Non-blocking side effects — never break the screen if they fail.
      void this.loadQuotes();
      void this.registerForPushNotifications();
      void this.subscribeToLivePrices();

      this.updateLoadingState(false, null, 'init');
    } catch (error) {
      this.handleError(error, 'init');
    }
  }

  dispose(): void {
    this.priceTeardown?.();
    this.priceTeardown = null;
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  /** Seed real prices + daily change for the (non-crypto) stocks. */
  private async loadQuotes(): Promise<void> {
    const stockSymbols = WATCH_SYMBOLS.filter((s) => !isCrypto(s));
    await Promise.allSettled(
      stockSymbols.map(async (symbol) => {
        try {
          const detail = await this.getStockDetailUseCase.run(symbol);
          const q = detail.quote;
          if (q.current > 0) {
            runInAction(() => {
              this.quotes.set(symbol, {
                previousClose: q.previousClose,
                open: q.open,
                current: q.current,
              });
              if (!this.priceHistory.has(symbol)) {
                this.priceHistory.set(
                  symbol,
                  [q.previousClose, q.open, q.current].filter((v) => v > 0),
                );
              }
            });
          }
        } catch {
          // Ignore individual quote failures (rate limits / closed market).
        }
      }),
    );
  }

  private async subscribeToLivePrices(): Promise<void> {
    try {
      this.priceTeardown = await this.subscribeToPricesUseCase.run({
        symbols: WATCH_SYMBOLS,
        onTrade: (trade: Trade) => this.onTrade(trade),
      });
    } catch (error) {
      this.logger.error(
        `Live price subscription failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private onTrade(trade: Trade): void {
    runInAction(() => {
      this.livePrices.set(trade.symbol, trade.price);
      if (!this.sessionBase.has(trade.symbol)) {
        this.sessionBase.set(trade.symbol, trade.price);
      }
      const prev = this.priceHistory.get(trade.symbol) ?? [];
      this.priceHistory.set(
        trade.symbol,
        [...prev, trade.price].slice(-MAX_POINTS),
      );

      let total = 0;
      for (const w of WATCHLIST) {
        total +=
          this.livePrices.get(w.symbol) ??
          this.quotes.get(w.symbol)?.current ??
          0;
      }
      this.aggregateHistory = [...this.aggregateHistory, total].slice(
        -MAX_POINTS,
      );
    });
  }

  private async registerForPushNotifications(): Promise<void> {
    try {
      const registration = await this.registerPushNotificationsUseCase.run();
      if (registration.error) {
        this.logger.warn(`Push not registered: ${registration.error}`);
        return;
      }
      this.logger.info('Push registered for device:', registration.token);
    } catch (error) {
      this.logger.error(
        `Push registration failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private updateLoadingState(
    isLoading: boolean,
    error: string | null,
    type: ICalls,
  ) {
    runInAction(() => {
      if (type === 'init') {
        this.isInitLoading = isLoading;
        this.isInitError = error;
      }
    });
  }

  private handleError(error: unknown, type: ICalls) {
    const message = `Error in ${type}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    this.logger.error(message);
    this.updateLoadingState(false, message, type);
  }
}
