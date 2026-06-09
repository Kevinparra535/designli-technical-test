// src/domain/useCases/LogoutUseCase.ts
//
// One business action: sign out (clears the stored token).

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import type { SessionRepository } from '@/domain/repositories/SessionRepository';

import { UseCase } from '@/domain/useCases/UseCase';

@injectable()
export class LogoutUseCase implements UseCase<void, void> {
  constructor(
    @inject(TYPES.SessionRepository)
    private readonly sessionRepository: SessionRepository,
  ) {}

  run(): Promise<void> {
    return this.sessionRepository.logout();
  }
}
