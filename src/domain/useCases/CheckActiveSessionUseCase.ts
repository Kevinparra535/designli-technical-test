// src/domain/useCases/CheckActiveSessionUseCase.ts
//
// One business action: resolve the current session from the stored token
// (returns null when there is no valid session).

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { User } from '@/domain/entities/User';

import type { SessionRepository } from '@/domain/repositories/SessionRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class CheckActiveSessionUseCase implements UseCase<void, User | null> {
  constructor(
    @inject(TYPES.SessionRepository)
    private readonly sessionRepository: SessionRepository,
  ) {}

  run(): Promise<User | null> {
    return this.sessionRepository.checkActiveSession();
  }
}
