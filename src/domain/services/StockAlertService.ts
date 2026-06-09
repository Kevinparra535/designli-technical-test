// src/domain/services/StockAlertService.ts
//
// Domain contract for creating stock price alerts. The data-layer impl wraps the
// WebhookManager and maps the transport response into the StockAlert entity.

import { AlertTestResult } from '@/domain/entities/AlertTestResult';
import { StockAlert } from '@/domain/entities/StockAlert';

export interface StockAlertService {
  createAlert(alert: StockAlert): Promise<StockAlert>;
  getAlerts(): Promise<StockAlert[]>;
  deleteAlert(id: string): Promise<void>;
  testAlert(id: string): Promise<AlertTestResult>;
}
