// src/data/services/AuthServiceImpl.ts
//
// Auth service: drives the backend /auth endpoints (AuthApiManager) and persists
// the JWT (AuthTokenStore). It is the single DTO→domain crossing for auth.
//
// Injects two managers (HTTP API + secure storage) — a justified deviation from
// the one-manager rule, like NotificationServiceImpl.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { User } from '@/domain/entities/User';

import type { AuthService } from '@/domain/services/AuthService';

import type { AuthApiManager } from '@/data/network/authApiManager';

import { UserModel } from '@/data/models/UserModel';

import type { AuthTokenStore } from '@/data/storage/authTokenStore';

@injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @inject(TYPES.AuthApiManager)
    private readonly apiManager: AuthApiManager,
    @inject(TYPES.AuthTokenStore)
    private readonly tokenStore: AuthTokenStore,
  ) {}

  async login(email: string, password: string): Promise<User> {
    const response = await this.apiManager.login(email, password);
    await this.tokenStore.setToken(response.token);
    return UserModel.fromJson(response.user).toDomain();
  }

  async checkActiveSession(): Promise<User | null> {
    const token = await this.tokenStore.load();
    if (!token) return null;

    try {
      const response = await this.apiManager.me();
      return UserModel.fromJson(response.user).toDomain();
    } catch {
      // Token expired / invalid — drop it so the user is sent back to login.
      await this.tokenStore.clear();
      return null;
    }
  }

  async logout(): Promise<void> {
    await this.tokenStore.clear();
  }
}
