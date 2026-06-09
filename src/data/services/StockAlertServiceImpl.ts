// src/data/services/StockAlertServiceImpl.ts
//
// Service impl: bridges the StockAlert domain to the generic WebhookManager.
// Encodes the alert into the webhook `event`, registers it, and maps the
// registration response back into a StockAlert. Single DTO↔domain crossing.

import { inject, injectable } from 'inversify';

import { config } from '@/config/config';
import { TYPES } from '@/config/types';

import { StockAlert } from '@/domain/entities/StockAlert';

import type { StockAlertService } from '@/domain/services/StockAlertService';

import { WebhookManager } from '@/data/network/webhookManager';

import {
  STOCK_ALERT_EVENT_PREFIX,
  StockAlertModel,
} from '@/data/models/StockAlertModel';

@injectable()
export class StockAlertServiceImpl implements StockAlertService {
  constructor(
    @inject(TYPES.WebhookManager)
    private readonly service: WebhookManager,
  ) {}

  async createAlert(alert: StockAlert): Promise<StockAlert> {
    const event = StockAlertModel.encodeEvent(
      alert.symbol,
      alert.condition,
      alert.targetPrice,
    );
    const callbackUrl = `${config.WEBHOOK_BASE_URL}/notifications`;
    const registration = await this.service.registerWebhook(callbackUrl, event);
    return StockAlertModel.fromJson(registration).toDomain();
  }

  async getAlerts(): Promise<StockAlert[]> {
    const registrations = await this.service.listWebhooks();
    return registrations
      // The backend stores all webhooks together; keep only stock price alerts.
      .filter((reg) => reg.event.startsWith(`${STOCK_ALERT_EVENT_PREFIX}:`))
      .map((reg) => StockAlertModel.fromJson(reg).toDomain())
      // Newest first.
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }

  deleteAlert(id: string): Promise<void> {
    return this.service.deleteWebhook(id);
  }
}
