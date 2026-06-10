import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { StockAlert } from '@/domain/entities/StockAlert';

import { DeleteStockAlertUseCase } from '@/domain/useCases/DeleteStockAlertUseCase';
import { GetStockAlertsUseCase } from '@/domain/useCases/GetStockAlertsUseCase';
import { TestStockAlertUseCase } from '@/domain/useCases/TestStockAlertUseCase';

import Logger from '@/shared/Logger';

@injectable()
export class AlertsListViewModel {
  // ── Read group ────────────────────────────────────────────────────────────
  alerts: StockAlert[] = [];
  isLoading = false;
  isRefreshing = false;
  error: string | null = null;

  // ── Write group (per-row delete / test) ────────────────────────────────────
  deletingId: string | null = null;
  testingId: string | null = null;
  testMessage: string | null = null;

  private logger = new Logger('AlertsListViewModel');

  constructor(
    @inject(TYPES.GetStockAlertsUseCase)
    private readonly getStockAlertsUseCase: GetStockAlertsUseCase,
    @inject(TYPES.DeleteStockAlertUseCase)
    private readonly deleteStockAlertUseCase: DeleteStockAlertUseCase,
    @inject(TYPES.TestStockAlertUseCase)
    private readonly testStockAlertUseCase: TestStockAlertUseCase,
  ) {
    makeAutoObservable(this);
  }

  // ── Computed ─────────────────────────────────────────────────────────────────

  get isEmpty(): boolean {
    return !this.isLoading && !this.error && this.alerts.length === 0;
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  /** Initial load — shows the full-screen spinner. */
  async load(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    await this.fetch();
    runInAction(() => {
      this.isLoading = false;
    });
  }

  /** Pull-to-refresh — keeps the list visible while reloading. */
  async refresh(): Promise<void> {
    runInAction(() => {
      this.isRefreshing = true;
      this.error = null;
    });
    await this.fetch();
    runInAction(() => {
      this.isRefreshing = false;
    });
  }

  async delete(id: string): Promise<void> {
    if (this.deletingId) return;
    runInAction(() => {
      this.deletingId = id;
      this.error = null;
    });
    try {
      await this.deleteStockAlertUseCase.run(id);
      runInAction(() => {
        this.alerts = this.alerts.filter((alert) => alert.id !== id);
      });
    } catch (error) {
      this.handleError(error, 'delete');
    } finally {
      runInAction(() => {
        this.deletingId = null;
      });
    }
  }

  /** Fire a test push notification for an alert and surface the outcome. */
  async test(id: string): Promise<void> {
    if (this.testingId) return;
    runInAction(() => {
      this.testingId = id;
      this.testMessage = null;
      this.error = null;
    });
    try {
      const result = await this.testStockAlertUseCase.run(id);

      if (result.sent > 0) {
        this.logger.info(
          `✅ Test notification sent for ${result.symbol}: ${result.sent}/${result.devices} device(s) delivered.`,
        );
      } else {
        this.logger.error(
          `❌ Test notification failed for ${result.symbol}: 0/${result.devices} delivered` +
            (result.failed > 0
              ? ` (${result.failed} failed)`
              : ' (no devices registered)') +
            '.',
        );
      }

      runInAction(() => {
        this.testMessage =
          result.devices === 0
            ? 'No devices registered for push yet — open the app on a device build.'
            : `Test sent for ${result.symbol} · ${result.sent}/${result.devices} device(s)` +
              (result.failed > 0 ? ` · ${result.failed} failed` : '');
      });
    } catch (error) {
      this.logger.error(
        `❌ Test notification request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.handleError(error, 'test');
    } finally {
      runInAction(() => {
        this.testingId = null;
      });
    }
  }

  /** Dismiss the transient test-result banner. */
  clearTestMessage(): void {
    runInAction(() => {
      this.testMessage = null;
    });
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async fetch(): Promise<void> {
    try {
      const alerts = await this.getStockAlertsUseCase.run();
      runInAction(() => {
        this.alerts = alerts;
      });
    } catch (error) {
      this.handleError(error, 'load');
    }
  }

  private handleError(error: unknown, action: string) {
    const message = `Error in ${action}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    this.logger.error(message);
    runInAction(() => {
      this.error = message;
    });
  }
}
