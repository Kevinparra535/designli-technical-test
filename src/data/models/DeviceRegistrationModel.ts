// src/data/models/DeviceRegistrationModel.ts
//
// Transport model (DTO) for a device registration returned by the backend's
// POST /devices. Owns the DTO→domain mapping.

import {
  type DevicePlatform,
  DeviceRegistration,
} from '@/domain/entities/DeviceRegistration';

export type DeviceRegistrationJson = {
  id: string;
  token: string;
  platform: string;
  active: boolean;
  createdAt: string;
};

export class DeviceRegistrationModel {
  readonly id: string;
  readonly token: string;
  readonly platform: string;
  readonly active: boolean;
  readonly createdAt: string;

  constructor(json: DeviceRegistrationJson) {
    this.id = json.id;
    this.token = json.token;
    this.platform = json.platform;
    this.active = json.active;
    this.createdAt = json.createdAt;
  }

  static fromJson(json: DeviceRegistrationJson): DeviceRegistrationModel {
    return new DeviceRegistrationModel(json);
  }

  toDomain(): DeviceRegistration {
    const platform: DevicePlatform =
      this.platform === 'ios' ? 'ios' : 'android';
    return new DeviceRegistration({
      token: this.token,
      platform,
      active: this.active,
      createdAt: this.createdAt ?? null,
      error: null,
    });
  }
}
