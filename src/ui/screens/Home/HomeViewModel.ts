import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { Stock } from '@/domain/entities/Stock';

import { GetStockListUseCase } from '@/domain/useCases/GetStockListUseCase';
import { RegisterPushNotificationsUseCase } from '@/domain/useCases/RegisterPushNotificationsUseCase';

import Logger from '@/ui/utils/Logger';

type ICalls = 'init';

@injectable()
export class HomeViewModel {
  isInitLoading = false;
  isInitError: string | null = null;
  stocks: Stock[] = [];

  private logger = new Logger('HomeViewModel');

  constructor(
    @inject(TYPES.GetStockListUseCase)
    private readonly getStockListUseCase: GetStockListUseCase,
    @inject(TYPES.RegisterPushNotificationsUseCase)
    private readonly registerPushNotificationsUseCase: RegisterPushNotificationsUseCase,
  ) {
    makeAutoObservable(this);
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

      this.updateLoadingState(false, null, 'init');
    } catch (error) {
      this.handleError(error, 'init');
    }
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
