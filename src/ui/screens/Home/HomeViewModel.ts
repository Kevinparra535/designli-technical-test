import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { Stock } from '@/domain/entities/Stock';

import { GetStockListUseCase } from '@/domain/useCases/GetStockListUseCase';

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

      this.updateLoadingState(false, null, 'init');
    } catch (error) {
      this.handleError(error, 'init');
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
