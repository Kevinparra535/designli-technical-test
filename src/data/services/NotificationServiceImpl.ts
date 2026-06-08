// src/data/services/NotificationServiceImpl.ts
//
// Orchestrates the push-registration flow: configure the foreground handler,
// request permission, obtain the FCM device token (PushNotificationManager),
// then register it with the backend (NotificationApiManager) and map the
// response into the domain.
//
// Note: this service injects TWO managers — a justified deviation from the
// one-manager rule, since the feature genuinely spans the device SDK and the
// backend HTTP API. Deps are named descriptively (not `service`).

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { DeviceRegistration } from '@/domain/entities/DeviceRegistration';

import type { NotificationService } from '@/domain/services/NotificationService';

import type { NotificationApiManager } from '@/data/network/notificationApiManager';
import type { PushNotificationManager } from '@/data/network/pushNotificationManager';

import { DeviceRegistrationModel } from '@/data/models/DeviceRegistrationModel';

@injectable()
export class NotificationServiceImpl implements NotificationService {
  constructor(
    @inject(TYPES.PushNotificationManager)
    private readonly pushManager: PushNotificationManager,
    @inject(TYPES.NotificationApiManager)
    private readonly apiManager: NotificationApiManager,
  ) {}

  async registerForPriceAlerts(): Promise<DeviceRegistration> {
    this.pushManager.configure();

    const granted = await this.pushManager.requestPermissions();
    if (!granted) {
      return new DeviceRegistration({
        token: '',
        platform: 'android',
        active: false,
        createdAt: null,
        error: 'Notification permission was not granted.',
      });
    }

    const device = await this.pushManager.getDeviceToken();
    if (!device) {
      return new DeviceRegistration({
        token: '',
        platform: 'android',
        active: false,
        createdAt: null,
        error: 'Could not obtain the FCM device token.',
      });
    }

    const registration = await this.apiManager.registerDevice(
      device.token,
      device.platform,
    );
    return DeviceRegistrationModel.fromJson(registration).toDomain();
  }
}
