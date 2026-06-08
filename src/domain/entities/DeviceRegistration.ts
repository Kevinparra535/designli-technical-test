// src/domain/entities/DeviceRegistration.ts
//
// A device's registration for push notifications. `token` is the native FCM
// registration token (from expo-notifications' getDevicePushTokenAsync) the
// backend targets via firebase-admin. Pure data class, no framework imports.

export type DevicePlatform = 'android' | 'ios';

export interface ConstructorParams {
  token: string;
  platform: DevicePlatform;
  active: boolean;
  createdAt: string | null;
  error?: string | null;
  [key: string]: any;
}

export class DeviceRegistration {
  public token: ConstructorParams['token'];
  public platform: ConstructorParams['platform'];
  public active: ConstructorParams['active'];
  public createdAt: ConstructorParams['createdAt'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.token = model.token;
    this.platform = model.platform;
    this.active = model.active;
    this.createdAt = model.createdAt;
    this.error = model.error;
  }
}
