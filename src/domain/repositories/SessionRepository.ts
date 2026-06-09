// src/domain/repositories/SessionRepository.ts
//
// Domain contract the auth use cases depend on. The impl delegates to the
// AuthService.

import { User } from '@/domain/entities/User';

export interface SessionRepository {
  login(email: string, password: string): Promise<User>;
  checkActiveSession(): Promise<User | null>;
  logout(): Promise<void>;
}
