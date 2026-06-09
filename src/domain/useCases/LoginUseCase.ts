// src/domain/useCases/LoginUseCase.ts
//
// One business action: authenticate with email + password.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { User } from '@/domain/entities/User';

import type { SessionRepository } from '@/domain/repositories/SessionRepository';

import { UseCase } from '@/domain/useCases/UseCase';

export type LoginInput = {
  email: string;
  password: string;
};

@injectable()
export class LoginUseCase implements UseCase<LoginInput, User> {
  constructor(
    @inject(TYPES.SessionRepository)
    private readonly sessionRepository: SessionRepository,
  ) {}

  run(input: LoginInput): Promise<User> {
    return this.sessionRepository.login(input.email, input.password);
  }
}
