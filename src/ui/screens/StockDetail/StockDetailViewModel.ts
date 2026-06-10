import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import type { StockAlert } from '@/domain/entities/StockAlert';
import type { StockDetail } from '@/domain/entities/StockDetail';
import { Trade } from '@/domain/entities/Trade';

import { GetStockAlertsUseCase } from '@/domain/useCases/GetStockAlertsUseCase';
import { GetStockDetailUseCase } from '@/domain/useCases/GetStockDetailUseCase';
import { SubscribeToPricesUseCase } from '@/domain/useCases/SubscribeToPricesUseCase';

import Logger from '@/shared/Logger';

type ICalls = 'detail';

const MAX_POINTS = 60;

@injectable()
export class StockDetailViewModel {
  symbol = '';
  isLoading = false;
  error: string | null = null;
  detail: StockDetail | null = null;
  alert: StockAlert | null = null;

  /** Live price + tick history from the websocket (drives crypto + live chart). */
  livePrice: number | null = null;
  liveHistory: number[] = [];

  private logger = new Logger('StockDetailViewModel');
  private priceTeardown: (() => void) | null = null;

  constructor(
    @inject(TYPES.GetStockDetailUseCase)
    private readonly getStockDetailUseCase: GetStockDetailUseCase,
    @inject(TYPES.GetStockAlertsUseCase)
    private readonly getStockAlertsUseCase: GetStockAlertsUseCase,
    @inject(TYPES.SubscribeToPricesUseCase)
    private readonly subscribeToPricesUseCase: SubscribeToPricesUseCase,
  ) {
    makeAutoObservable(this);
  }

  // ── Computed ─────────────────────────────────────────────────────────────────

  get quote() {
    return this.detail?.quote ?? null;
  }

  get profile() {
    return this.detail?.profile ?? null;
  }

  /** True when Finnhub returned a real REST quote (false for crypto). */
  get hasQuote(): boolean {
    return (this.quote?.current ?? 0) > 0;
  }

  /** Best available price: live websocket price wins, else the REST quote. */
  get price(): number {
    return this.livePrice ?? this.quote?.current ?? 0;
  }

  get priceAvailable(): boolean {
    return this.price > 0;
  }

  /** Today's change — daily from the quote, or session-based for live-only. */
  get changeValue(): number {
    if (this.hasQuote) return this.quote?.change ?? 0;
    if (this.liveHistory.length >= 2) {
      return this.price - this.liveHistory[0];
    }
    return 0;
  }

  get percentChange(): number {
    if (this.hasQuote) return this.quote?.percentChange ?? 0;
    const first = this.liveHistory[0];
    if (this.liveHistory.length >= 2 && first > 0) {
      return ((this.price - first) / first) * 100;
    }
    return 0;
  }

  get isUp(): boolean {
    return this.changeValue >= 0;
  }

  /** Chart series: the quote's intraday trajectory plus any live ticks. */
  get series(): number[] {
    if (this.hasQuote && this.quote) {
      const seed = [this.quote.previousClose, this.quote.open].filter(
        (v) => v > 0,
      );
      const tail =
        this.liveHistory.length > 0 ? this.liveHistory : [this.quote.current];
      return [...seed, ...tail];
    }
    return this.liveHistory;
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async load(symbol: string): Promise<void> {
    this.teardownPrices();
    runInAction(() => {
      this.symbol = symbol;
      this.alert = null;
      this.livePrice = null;
      this.liveHistory = [];
    });
    this.updateLoadingState(true, null, 'detail');
    try {
      const detail = await this.getStockDetailUseCase.run(symbol);
      runInAction(() => {
        this.detail = detail;
      });
      this.updateLoadingState(false, null, 'detail');
      void this.loadExistingAlert(symbol);
      void this.subscribeToLivePrice(symbol);
    } catch (error) {
      this.handleError(error, 'detail');
    }
  }

  dispose(): void {
    this.teardownPrices();
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private async subscribeToLivePrice(symbol: string): Promise<void> {
    try {
      const teardown = await this.subscribeToPricesUseCase.run({
        symbols: [symbol],
        onTrade: (trade: Trade) => {
          if (trade.symbol !== symbol) return;
          runInAction(() => {
            this.livePrice = trade.price;
            this.liveHistory = [...this.liveHistory, trade.price].slice(
              -MAX_POINTS,
            );
          });
        },
      });
      // If load() ran again before this resolved, drop the stale subscription.
      if (this.symbol === symbol) {
        this.priceTeardown = teardown;
      } else {
        teardown();
      }
    } catch (error) {
      this.logger.warn(
        `Live price subscription failed for ${symbol}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private teardownPrices(): void {
    this.priceTeardown?.();
    this.priceTeardown = null;
  }

  private async loadExistingAlert(symbol: string): Promise<void> {
    try {
      const alerts = await this.getStockAlertsUseCase.run();
      const match = alerts.find((a) => a.symbol === symbol) ?? null;
      runInAction(() => {
        this.alert = match;
      });
    } catch (error) {
      this.logger.warn(
        `Could not load alerts for ${symbol}: ${
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
      if (type === 'detail') {
        this.isLoading = isLoading;
        this.error = error;
      }
    });
  }

  private handleError(error: unknown, type: ICalls) {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : error instanceof Error
          ? error.message
          : String(error);
    this.logger.error(`Error in ${type}: ${message}`);
    this.updateLoadingState(false, message, type);
  }
}
