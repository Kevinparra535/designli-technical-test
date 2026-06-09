import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { type AlertCondition, StockAlert } from '@/domain/entities/StockAlert';

import { CreateStockAlertUseCase } from '@/domain/useCases/CreateStockAlertUseCase';

import Logger from '@/ui/utils/Logger';

export type { AlertCondition };

/** Validated form payload handed in by the screen (react-hook-form + zod). */
export type CreateAlertInput = {
  symbol: string;
  targetPrice: number;
  condition: AlertCondition;
};

@injectable()
export class CreateStockAlertViewModel {
  // Input state + client validation now live in the screen (react-hook-form).
  // The ViewModel owns only the business action and its async status.
  isSubmitting = false;
  submitError: string | null = null;

  private logger = new Logger('CreateStockAlertViewModel');

  constructor(
    @inject(TYPES.CreateStockAlertUseCase)
    private readonly createStockAlertUseCase: CreateStockAlertUseCase,
  ) {
    makeAutoObservable(this);
  }

  /** Create the alert. Returns true on success so the screen can react. */
  async submit(input: CreateAlertInput): Promise<boolean> {
    runInAction(() => {
      this.isSubmitting = true;
      this.submitError = null;
    });
    try {
      const draft = new StockAlert({
        id: '',
        symbol: input.symbol,
        targetPrice: input.targetPrice,
        condition: input.condition,
        active: true,
        createdAt: null,
        error: null,
      });

      const created = await this.createStockAlertUseCase.run(draft);
      this.logger.info('Stock price alert created:', created);

      runInAction(() => {
        this.isSubmitting = false;
      });
      return true;
    } catch (error) {
      const message = `Error creating alert: ${
        error instanceof Error ? error.message : String(error)
      }`;
      this.logger.error(message);
      runInAction(() => {
        this.isSubmitting = false;
        this.submitError = message;
      });
      return false;
    }
  }

  clearError(): void {
    runInAction(() => {
      this.submitError = null;
    });
  }
}
