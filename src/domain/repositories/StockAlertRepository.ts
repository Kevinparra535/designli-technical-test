// src/domain/repositories/StockAlertRepository.ts
//
// Domain contract the CreateStockAlertUseCase depends on. The impl delegates to
// the StockAlertService.

import { StockAlert } from '@/domain/entities/StockAlert';

export interface StockAlertRepository {
  createAlert(alert: StockAlert): Promise<StockAlert>;
}
