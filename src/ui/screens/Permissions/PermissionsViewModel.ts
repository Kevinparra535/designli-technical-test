import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { RegisterPushNotificationsUseCase } from '@/domain/useCases/RegisterPushNotificationsUseCase';

import Logger from '@/ui/utils/Logger';

@injectable()
export class PermissionsViewModel {
  isRequesting = false;
  isGranted = false;
  wasDenied = false;

  private logger = new Logger('PermissionsViewModel');

  constructor(
    @inject(TYPES.RegisterPushNotificationsUseCase)
    private readonly registerPushNotificationsUseCase: RegisterPushNotificationsUseCase,
  ) {
    makeAutoObservable(this);
  }

  /**
   * Trigger the real system permission prompt + device registration.
   * Returns true when notifications were granted.
   */
  async enable(): Promise<boolean> {
    runInAction(() => {
      this.isRequesting = true;
      this.wasDenied = false;
    });
    try {
      const registration = await this.registerPushNotificationsUseCase.run();
      const granted = !registration.error && !!registration.token;
      runInAction(() => {
        this.isGranted = granted;
        this.wasDenied = !granted;
        this.isRequesting = false;
      });
      if (granted) {
        this.logger.info('Push notifications granted:', registration.token);
      } else {
        this.logger.warn(`Push not granted: ${registration.error ?? 'denied'}`);
      }
      return granted;
    } catch (error) {
      this.logger.error(
        `Permission request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      runInAction(() => {
        this.isRequesting = false;
        this.wasDenied = true;
      });
      return false;
    }
  }
}
