// src/data/network/notificationApiManager.ts
//
// Talks to the user's Node backend to register the device's FCM token so the
// backend can push price-alert notifications. Wraps the shared HttpManager
// (mirrors webhookManager.ts).

import { inject, injectable } from 'inversify';

import { config } from '@/config/config';
import { TYPES } from '@/config/types';

import { HttpManager } from '@/data/network/axiosManager';

import type { DeviceRegistrationJson } from '@/data/models/DeviceRegistrationModel';

import Logger from '@/shared/Logger';

export interface NotificationApiManager {
  registerDevice(
    token: string,
    platform: string,
  ): Promise<DeviceRegistrationJson>;
}

@injectable()
export class NotificationApiManagerImpl implements NotificationApiManager {
  private readonly baseUrl = config.BACKEND_BASE_URL;
  private readonly logger = new Logger('NotificationApiManager');

  constructor(@inject(TYPES.HttpManager) private readonly http: HttpManager) {}

  private buildUrl(path: string): string {
    if (!this.baseUrl) {
      const error = new Error(
        'Backend base URL is not configured. Set EXPO_PUBLIC_BACKEND_BASE_URL in environment variables.',
      );
      this.logger.error(error.message);
      throw error;
    }
    return `${this.baseUrl}${path}`;
  }

  async registerDevice(
    token: string,
    platform: string,
  ): Promise<DeviceRegistrationJson> {
    return this.http.post<DeviceRegistrationJson>(
      this.buildUrl(config.API_ROUTES.DEVICES),
      { token, platform },
    );
  }
}
