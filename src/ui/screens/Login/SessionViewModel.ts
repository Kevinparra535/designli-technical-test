import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { User } from '@/domain/entities/User';

import { CheckActiveSessionUseCase } from '@/domain/useCases/CheckActiveSessionUseCase';
import { LoginUseCase } from '@/domain/useCases/LoginUseCase';
import { LogoutUseCase } from '@/domain/useCases/LogoutUseCase';

import Logger from '@/shared/Logger';

// App-global session state. Bound as a SINGLETON (the rare global-VM exception)
// so both LoginScreen and RootNavigator observe the same instance.
/** Credentials handed in by the login screen (react-hook-form + zod). */
export type Credentials = { email: string; password: string };

@injectable()
export class SessionViewModel {
  // ── Session state ─────────────────────────────────────────────────────────────
  isCheckingSession = true;
  currentUser: User | null = null;

  // True right after a fresh login → routes the user through the notification
  // permissions onboarding once before entering the app. A restored session
  // (checkSession) skips it.
  needsPermissionsOnboarding = false;

  // ── Login state ───────────────────────────────────────────────────────────────
  isSubmitting = false;
  submitError: string | null = null;

  private logger = new Logger('SessionViewModel');

  constructor(
    @inject(TYPES.LoginUseCase)
    private readonly loginUseCase: LoginUseCase,
    @inject(TYPES.CheckActiveSessionUseCase)
    private readonly checkActiveSessionUseCase: CheckActiveSessionUseCase,
    @inject(TYPES.LogoutUseCase)
    private readonly logoutUseCase: LogoutUseCase,
  ) {
    makeAutoObservable(this);
  }

  // ── Computed ─────────────────────────────────────────────────────────────────

  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // ── Actions ────────────────────────────────────────────────────────────────────

  async checkSession(): Promise<void> {
    runInAction(() => {
      this.isCheckingSession = true;
    });
    try {
      const user = await this.checkActiveSessionUseCase.run();
      runInAction(() => {
        this.currentUser = user;
      });
    } catch (error) {
      this.logger.error(`checkSession failed: ${this.toMessage(error)}`);
      runInAction(() => {
        this.currentUser = null;
      });
    } finally {
      runInAction(() => {
        this.isCheckingSession = false;
      });
    }
  }

  async signIn(credentials: Credentials): Promise<boolean> {
    runInAction(() => {
      this.isSubmitting = true;
      this.submitError = null;
    });
    try {
      const user = await this.loginUseCase.run({
        email: credentials.email,
        password: credentials.password,
      });
      runInAction(() => {
        this.currentUser = user;
        this.isSubmitting = false;
        this.needsPermissionsOnboarding = true;
      });
      return true;
    } catch (error) {
      const message = this.toMessage(error);
      this.logger.error(`signIn failed: ${message}`);
      runInAction(() => {
        this.isSubmitting = false;
        this.submitError = message;
      });
      return false;
    }
  }

  /** Finish the post-login notification-permissions step → enter the app. */
  completePermissionsOnboarding(): void {
    runInAction(() => {
      this.needsPermissionsOnboarding = false;
    });
  }

  async signOut(): Promise<void> {
    try {
      await this.logoutUseCase.run();
    } catch (error) {
      this.logger.error(`signOut failed: ${this.toMessage(error)}`);
    }
    runInAction(() => {
      this.currentUser = null;
      this.submitError = null;
    });
  }

  private toMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return error instanceof Error ? error.message : 'Something went wrong';
  }
}
