// src/domain/useCases/RegisterPushNotificationsUseCase.ts
//
// One business action: register this device for price-alert push notifications
// (permission → FCM token → backend registration). Depends only on the
// NotificationRepository contract.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { DeviceRegistration } from '@/domain/entities/DeviceRegistration';

import type { NotificationRepository } from '@/domain/repositories/NotificationRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class RegisterPushNotificationsUseCase implements UseCase<
  void,
  DeviceRegistration
> {
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  run(): Promise<DeviceRegistration> {
    return this.notificationRepository.registerForPriceAlerts();
  }
}
