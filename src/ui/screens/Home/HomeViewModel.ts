import { injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import Logger from '@/ui/utils/Logger';

type ICalls = 'init';

@injectable()
export class HomeViewModel {
  isInitLoading = false;
  isInitError: string | null = null;

  private logger = new Logger('HomeViewModel');

  constructor() {
    makeAutoObservable(this);
  }

  async initialize(): Promise<void> {
    this.updateLoadingState(true, null, 'init');
    try {
      // TODO: Add initialization logic (e.g., fetch user data, load preferences)
      this.updateLoadingState(false, null, 'init');
    } catch (error) {
      this.handleError(error, 'init');
    }
  }

  private updateLoadingState(isLoading: boolean, error: string | null, type: ICalls) {
    runInAction(() => {
      if (type === 'init') {
        this.isInitLoading = isLoading;
        this.isInitError = error;
      }
    });
  }

  private handleError(error: unknown, type: ICalls) {
    const message = `Error in ${type}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    this.logger.error(message);
    this.updateLoadingState(false, message, type);
  }
}
