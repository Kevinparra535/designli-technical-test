// src/data/network/authApiManager.ts
//
// Talks to the backend's /auth endpoints. Wraps the shared HttpManager (which
// attaches the Bearer token via its request interceptor). Mirrors webhookManager.

import { inject, injectable } from 'inversify';

import { config } from '@/config/config';
import { TYPES } from '@/config/types';

import { HttpManager } from '@/data/network/axiosManager';

import type { UserJson } from '@/data/models/UserModel';

export type AuthResponseJson = {
  token: string;
  user: UserJson;
};

export type MeResponseJson = {
  user: UserJson;
};

export interface AuthApiManager {
  login(email: string, password: string): Promise<AuthResponseJson>;
  me(): Promise<MeResponseJson>;
}

@injectable()
export class AuthApiManagerImpl implements AuthApiManager {
  private readonly baseUrl = config.BACKEND_BASE_URL;

  constructor(@inject(TYPES.HttpManager) private readonly http: HttpManager) {}

  login(email: string, password: string): Promise<AuthResponseJson> {
    return this.http.post<AuthResponseJson>(
      `${this.baseUrl}${config.API_ROUTES.AUTH_LOGIN}`,
      { email, password },
    );
  }

  me(): Promise<MeResponseJson> {
    return this.http.get<MeResponseJson>(
      `${this.baseUrl}${config.API_ROUTES.AUTH_ME}`,
    );
  }
}
