// src/domain/repositories/NotificationRepository.ts
//
// Domain contract the RegisterPushNotificationsUseCase depends on. The impl
// delegates to the NotificationService.

import { DeviceRegistration } from '@/domain/entities/DeviceRegistration';

export interface NotificationRepository {
  registerForPriceAlerts(): Promise<DeviceRegistration>;
}
