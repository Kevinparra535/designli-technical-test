import { inject, injectable } from 'inversify';
import qs from 'qs';

import { config } from '@/config/config';
import { TYPES } from '@/config/types';

import { HttpManager } from '@/data/network/axiosManager';

import Logger from '@/ui/utils/Logger';

import type { AuthTokenStore } from '@/data/storage/authTokenStore';

export interface WebhookRegistration {
  id: string;
  url: string;
  event: string;
  active: boolean;
  createdAt: string;
}

/** Response of POST /webhooks/:id/test — the push fan-out outcome. */
export interface WebhookTestResult {
  alertId: string;
  symbol: string;
  currentPrice: number;
  devices: number;
  sent: number;
  failed: number;
}

export interface WebhookManager {
  registerWebhook(url: string, event: string): Promise<WebhookRegistration>;
  getWebhook(webhookId: string): Promise<WebhookRegistration>;
  listWebhooks(): Promise<WebhookRegistration[]>;
  deleteWebhook(webhookId: string): Promise<void>;
  testWebhook(webhookId: string): Promise<WebhookTestResult>;
}

@injectable()
export class WebhookManagerImpl implements WebhookManager {
  private readonly baseUrl = config.WEBHOOK_BASE_URL;
  private readonly apiKey = config.WEBHOOK_API_KEY;
  private readonly logger = new Logger('WebhookManager');

  constructor(
    @inject(TYPES.HttpManager) private readonly http: HttpManager,
    @inject(TYPES.AuthTokenStore)
    private readonly authTokenStore: AuthTokenStore,
  ) {}

  private buildUrl(
    path: string,
    params: Record<string, string | number | boolean> = {},
  ): string {
    if (!this.baseUrl) {
      const error = new Error(
        'Webhook base URL is not configured. Set WEBHOOK_BASE_URL in environment variables.',
      );
      this.logger.error(error.message);
      throw error;
    }

    // Alerts are a protected resource — require an authenticated session.
    // (The HttpManager interceptor attaches the Bearer token; this is the
    // fail-fast guard so we never fire an anonymous alert request.)
    if (!this.authTokenStore.getToken()) {
      const error = new Error('You must be signed in to manage alerts.');
      this.logger.error(error.message);
      throw error;
    }

    const query = qs.stringify(
      { token: this.apiKey || undefined, ...params },
      { addQueryPrefix: true, encode: false },
    );
    return `${this.baseUrl}${path}${query}`;
  }

  async registerWebhook(
    url: string,
    event: string,
  ): Promise<WebhookRegistration> {
    return this.http.post(this.buildUrl('/webhooks'), {
      url,
      event,
    });
  }

  async getWebhook(webhookId: string): Promise<WebhookRegistration> {
    const url = this.buildUrl(`/webhooks/${encodeURIComponent(webhookId)}`);
    return this.http.get(url);
  }

  async listWebhooks(): Promise<WebhookRegistration[]> {
    const url = this.buildUrl('/webhooks');
    return this.http.get(url);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    const url = this.buildUrl(`/webhooks/${encodeURIComponent(webhookId)}`);
    await this.http.delete(url);
  }

  async testWebhook(webhookId: string): Promise<WebhookTestResult> {
    const url = this.buildUrl(
      `/webhooks/${encodeURIComponent(webhookId)}/test`,
    );
    return this.http.post<WebhookTestResult>(url, {});
  }
}
