import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { Stock } from '@/domain/entities/Stock';
import { Trade } from '@/domain/entities/Trade';

import { GetStockListUseCase } from '@/domain/useCases/GetStockListUseCase';
import { RegisterPushNotificationsUseCase } from '@/domain/useCases/RegisterPushNotificationsUseCase';
import { SubscribeToPricesUseCase } from '@/domain/useCases/SubscribeToPricesUseCase';

import Logger from '@/ui/utils/Logger';

type ICalls = 'init';

// Symbols watched for live prices. Crypto trades 24/7, so the demo shows live
// data even when the US stock market is closed.
const PRICE_WATCHLIST = [
  'AAPL',
  'MSFT',
  'AMZN',
  'BINANCE:BTCUSDT',
  'BINANCE:ETHUSDT',
];

@injectable()
export class HomeViewModel {
  isInitLoading = false;
  isInitError: string | null = null;
  stocks: Stock[] = [];

  /** Latest price per watched symbol, updated live from the websocket. */
  livePrices = new Map<string, number>();

  private logger = new Logger('HomeViewModel');
  private priceTeardown: (() => void) | null = null;

  constructor(
    @inject(TYPES.GetStockListUseCase)
    private readonly getStockListUseCase: GetStockListUseCase,
    @inject(TYPES.RegisterPushNotificationsUseCase)
    private readonly registerPushNotificationsUseCase: RegisterPushNotificationsUseCase,
    @inject(TYPES.SubscribeToPricesUseCase)
    private readonly subscribeToPricesUseCase: SubscribeToPricesUseCase,
  ) {
    makeAutoObservable(this);
  }

  /** Watched symbols with their latest live price, for rendering. */
  get livePriceList(): { symbol: string; price: number }[] {
    return PRICE_WATCHLIST.map((symbol) => ({
      symbol,
      price: this.livePrices.get(symbol) ?? 0,
    }));
  }

  async initialize(): Promise<void> {
    this.updateLoadingState(true, null, 'init');
    try {
      const stocks = await this.getStockListUseCase.run();

      runInAction(() => {
        this.stocks = stocks;
      });

      // Solo consola por ahora: cantidad + una muestra de los primeros 10.
      this.logger.info(`Stock list fetched: ${stocks.length} symbols`);
      this.logger.info('Sample (first 10):', stocks.slice(0, 10));

      // Register this device for FCM price-alert pushes. Non-blocking: a backend
      // that is down must not break the screen. (Ideally moves to post-login.)
      void this.registerForPushNotifications();

      // Open the realtime price feed for the watchlist.
      void this.subscribeToLivePrices();

      this.updateLoadingState(false, null, 'init');
    } catch (error) {
      this.handleError(error, 'init');
    }
  }

  private async subscribeToLivePrices(): Promise<void> {
    try {
      this.priceTeardown = await this.subscribeToPricesUseCase.run({
        symbols: PRICE_WATCHLIST,
        onTrade: (trade: Trade) => {
          runInAction(() => {
            this.livePrices.set(trade.symbol, trade.price);
          });
        },
      });
    } catch (error) {
      this.logger.error(
        `Live price subscription failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** Tear down the realtime subscription. Call on screen unmount. */
  dispose(): void {
    this.priceTeardown?.();
    this.priceTeardown = null;
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
