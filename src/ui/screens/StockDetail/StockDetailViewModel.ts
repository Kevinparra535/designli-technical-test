import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import type { StockDetail } from '@/domain/entities/StockDetail';

import { GetStockDetailUseCase } from '@/domain/useCases/GetStockDetailUseCase';

import Logger from '@/ui/utils/Logger';

type ICalls = 'detail';

@injectable()
export class StockDetailViewModel {
  symbol = '';
  isLoading = false;
  error: string | null = null;
  detail: StockDetail | null = null;

  private logger = new Logger('StockDetailViewModel');

  constructor(
    @inject(TYPES.GetStockDetailUseCase)
    private readonly getStockDetailUseCase: GetStockDetailUseCase,
  ) {
    makeAutoObservable(this);
  }

  get isUp(): boolean {
    return (this.detail?.quote.change ?? 0) >= 0;
  }

  async load(symbol: string): Promise<void> {
    runInAction(() => {
      this.symbol = symbol;
    });
    this.updateLoadingState(true, null, 'detail');
    try {
      const detail = await this.getStockDetailUseCase.run(symbol);
      runInAction(() => {
        this.detail = detail;
      });
      this.updateLoadingState(false, null, 'detail');
    } catch (error) {
      this.handleError(error, 'detail');
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
