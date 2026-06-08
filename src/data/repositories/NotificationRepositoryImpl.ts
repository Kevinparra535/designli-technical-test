// src/data/repositories/NotificationRepositoryImpl.ts
//
// Repository impl: delegates to the NotificationService (which owns the device
// SDK + backend wiring). Passthrough by design.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { DeviceRegistration } from '@/domain/entities/DeviceRegistration';

import type { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import type { NotificationService } from '@/domain/services/NotificationService';

@injectable()
export class NotificationRepositoryImpl implements NotificationRepository {
  constructor(
    @inject(TYPES.NotificationService)
    private readonly service: NotificationService,
  ) {}

  registerForPriceAlerts(): Promise<DeviceRegistration> {
    return this.service.registerForPriceAlerts();
  }
}
