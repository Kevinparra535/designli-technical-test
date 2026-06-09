// src/domain/repositories/StockAlertRepository.ts
//
// Domain contract the CreateStockAlertUseCase depends on. The impl delegates to
// the StockAlertService.

import { AlertTestResult } from '@/domain/entities/AlertTestResult';
import { StockAlert } from '@/domain/entities/StockAlert';

export interface StockAlertRepository {
  createAlert(alert: StockAlert): Promise<StockAlert>;
  getAlerts(): Promise<StockAlert[]>;
  deleteAlert(id: string): Promise<void>;
  testAlert(id: string): Promise<AlertTestResult>;
}
