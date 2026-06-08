// src/data/network/pushNotificationManager.ts
//
// Infra adapter over expo-notifications + expo-device (device-side concerns:
// permission, foreground handler, FCM device token). It does NOT talk to the
// backend — registering the token is the NotificationApiManager's job.
//
// On Android, getDevicePushTokenAsync() returns the native FCM token (requires
// google-services.json wired in the build). Remote push does not work in Expo
// Go — needs an EAS build.

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { injectable } from 'inversify';

import Logger from '@/ui/utils/Logger';

export type DeviceToken = {
  token: string;
  platform: 'android' | 'ios';
};

export interface PushNotificationManager {
  configure(): void;
  requestPermissions(): Promise<boolean>;
  getDeviceToken(): Promise<DeviceToken | null>;
}

@injectable()
export class ExpoPushNotificationManager implements PushNotificationManager {
  private readonly logger = new Logger('PushNotificationManager');
  private configured = false;

  configure(): void {
    if (this.configured) return;
    this.configured = true;

    // Show the notification while the app is foregrounded.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    Notifications.addNotificationReceivedListener((notification) => {
      this.logger.info(
        'Price-alert notification received:',
        notification.request.content.data,
      );
    });
  }

  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      this.logger.warn('Push notifications require a physical device.');
      return false;
    }
    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    return status === 'granted';
  }

  async getDeviceToken(): Promise<DeviceToken | null> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('price-alerts', {
          name: 'Price alerts',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      return { token: String(devicePushToken.data), platform };
    } catch (error) {
      this.logger.error(
        `Failed to get device push token: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
