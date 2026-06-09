// src/data/repositories/SessionRepositoryImpl.ts
//
// Repository impl: delegates to the AuthService. Passthrough by design.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { User } from '@/domain/entities/User';

import type { SessionRepository } from '@/domain/repositories/SessionRepository';
import type { AuthService } from '@/domain/services/AuthService';

@injectable()
export class SessionRepositoryImpl implements SessionRepository {
  constructor(
    @inject(TYPES.AuthService)
    private readonly service: AuthService,
  ) {}

  login(email: string, password: string): Promise<User> {
    return this.service.login(email, password);
  }

  checkActiveSession(): Promise<User | null> {
    return this.service.checkActiveSession();
  }

  logout(): Promise<void> {
    return this.service.logout();
  }
}
