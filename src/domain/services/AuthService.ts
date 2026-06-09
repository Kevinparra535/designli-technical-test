// src/domain/services/AuthService.ts
//
// Domain contract for authentication. The impl talks to the backend's /auth
// endpoints and persists the JWT in secure storage.

import { User } from '@/domain/entities/User';

export interface AuthService {
  login(email: string, password: string): Promise<User>;
  checkActiveSession(): Promise<User | null>;
  logout(): Promise<void>;
}
