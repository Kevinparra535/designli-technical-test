import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';

import { TYPES } from '@/config/types';

import { User } from '@/domain/entities/User';

import { CheckActiveSessionUseCase } from '@/domain/useCases/CheckActiveSessionUseCase';
import { LoginUseCase } from '@/domain/useCases/LoginUseCase';
import { LogoutUseCase } from '@/domain/useCases/LogoutUseCase';

import Logger from '@/ui/utils/Logger';

// App-global session state. Bound as a SINGLETON (the rare global-VM exception)
// so both LoginScreen and RootNavigator observe the same instance.
@injectable()
export class SessionViewModel {
  // ── Form state ──────────────────────────────────────────────────────────────
  email = '';
  password = '';

  // ── Session state ─────────────────────────────────────────────────────────────
  isCheckingSession = true;
  currentUser: User | null = null;

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

  get isFormValid(): boolean {
    return this.email.trim().length > 3 && this.password.length >= 6;
  }

  // ── Field setters ──────────────────────────────────────────────────────────────

  setEmail(value: string): void {
    this.email = value.trim();
  }

  setPassword(value: string): void {
    this.password = value;
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

  async signIn(): Promise<boolean> {
    if (!this.isFormValid) {
      runInAction(() => {
        this.submitError =
          'Enter a valid email and a password of at least 6 characters.';
      });
      return false;
    }

    runInAction(() => {
      this.isSubmitting = true;
      this.submitError = null;
    });
    try {
      const user = await this.loginUseCase.run({
        email: this.email,
        password: this.password,
      });
      runInAction(() => {
        this.currentUser = user;
        this.password = '';
        this.isSubmitting = false;
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

  async signOut(): Promise<void> {
    try {
      await this.logoutUseCase.run();
    } catch (error) {
      this.logger.error(`signOut failed: ${this.toMessage(error)}`);
    }
    runInAction(() => {
      this.currentUser = null;
      this.email = '';
      this.password = '';
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
