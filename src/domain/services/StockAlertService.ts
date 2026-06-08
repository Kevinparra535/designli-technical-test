// src/domain/services/StockAlertService.ts
//
// Domain contract for creating stock price alerts. The data-layer impl wraps the
// WebhookManager and maps the transport response into the StockAlert entity.

import { StockAlert } from '@/domain/entities/StockAlert';

export interface StockAlertService {
  createAlert(alert: StockAlert): Promise<StockAlert>;
}
