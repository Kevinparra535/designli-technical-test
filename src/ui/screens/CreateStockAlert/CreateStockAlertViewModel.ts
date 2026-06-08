import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { type AlertCondition, StockAlert } from '@/domain/entities/StockAlert';

import { CreateStockAlertUseCase } from '@/domain/useCases/CreateStockAlertUseCase';

import Logger from '@/ui/utils/Logger';

export type { AlertCondition };

type ICalls = 'submit';

@injectable()
export class CreateStockAlertViewModel {
  // ── Form state ──────────────────────────────────────────────────────────────
  symbol = '';
  targetPrice = '';
  condition: AlertCondition = 'above';

  // ── Submit state (write group) ───────────────────────────────────────────────
  isSubmitting = false;
  submitError: string | null = null;
  hasSubmitSuccess = false;

  private logger = new Logger('CreateStockAlertViewModel');

  constructor(
    @inject(TYPES.CreateStockAlertUseCase)
    private readonly createStockAlertUseCase: CreateStockAlertUseCase,
  ) {
    makeAutoObservable(this);
  }

  // ── Computed ─────────────────────────────────────────────────────────────────

  get parsedPrice(): number {
    return Number(this.targetPrice.replace(',', '.'));
  }

  get isSymbolValid(): boolean {
    return this.symbol.trim().length > 0;
  }

  get isPriceValid(): boolean {
    return (
      this.targetPrice.trim().length > 0 &&
      Number.isFinite(this.parsedPrice) &&
      this.parsedPrice > 0
    );
  }

  get isValid(): boolean {
    return this.isSymbolValid && this.isPriceValid;
  }

  // ── Field setters ────────────────────────────────────────────────────────────

  setSymbol(value: string): void {
    this.symbol = value.toUpperCase().replace(/\s/g, '');
  }

  setTargetPrice(value: string): void {
    // Keep only digits and a single decimal separator.
    this.targetPrice = value.replace(/[^0-9.,]/g, '');
  }

  setCondition(value: AlertCondition): void {
    this.condition = value;
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async submit(): Promise<boolean> {
    if (!this.isValid) {
      this.updateLoadingState(
        false,
        'Enter a symbol and a valid price greater than 0.',
        'submit',
      );
      return false;
    }

    this.updateLoadingState(true, null, 'submit');
    try {
      const draft = new StockAlert({
        id: '',
        symbol: this.symbol,
        targetPrice: this.parsedPrice,
        condition: this.condition,
        active: true,
        createdAt: null,
        error: null,
      });

      const created = await this.createStockAlertUseCase.run(draft);
      this.logger.info('Stock price alert created:', created);

      runInAction(() => {
        this.hasSubmitSuccess = true;
      });
      this.updateLoadingState(false, null, 'submit');
      return true;
    } catch (error) {
      this.handleError(error, 'submit');
      return false;
    }
  }

  consumeSubmitResult(): void {
    runInAction(() => {
      this.hasSubmitSuccess = false;
      this.submitError = null;
    });
  }

  reset(): void {
    runInAction(() => {
      this.symbol = '';
      this.targetPrice = '';
      this.condition = 'above';
      this.isSubmitting = false;
      this.submitError = null;
      this.hasSubmitSuccess = false;
    });
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private updateLoadingState(
    isLoading: boolean,
    error: string | null,
    type: ICalls,
  ) {
    runInAction(() => {
      if (type === 'submit') {
        this.isSubmitting = isLoading;
        this.submitError = error;
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
