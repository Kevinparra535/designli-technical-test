// src/domain/services/NotificationService.ts
//
// Domain contract for push notifications. The impl configures the foreground
// handler, requests permission, obtains the FCM device token, and registers it
// with the backend so it can push price-alert notifications.

import { DeviceRegistration } from '@/domain/entities/DeviceRegistration';

export interface NotificationService {
  registerForPriceAlerts(): Promise<DeviceRegistration>;
}
