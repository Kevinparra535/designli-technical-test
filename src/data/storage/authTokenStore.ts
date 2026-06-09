// src/data/storage/authTokenStore.ts
//
// Persists the JWT in the device's secure storage (Keychain / Keystore) and
// keeps an in-memory copy so the axios request interceptor can read it
// synchronously. `load()` hydrates the in-memory copy on app start.

import * as SecureStore from 'expo-secure-store';
import { injectable } from 'inversify';

import Logger from '@/ui/utils/Logger';

const TOKEN_KEY = 'auth_token';

export interface AuthTokenStore {
  /** In-memory token (null until load()/setToken()). Used by the HTTP interceptor. */
  getToken(): string | null;
  /** Hydrate the in-memory token from secure storage. */
  load(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clear(): Promise<void>;
}

@injectable()
export class SecureAuthTokenStore implements AuthTokenStore {
  private token: string | null = null;
  private readonly logger = new Logger('AuthTokenStore');

  getToken(): string | null {
    return this.token;
  }

  async load(): Promise<string | null> {
    try {
      this.token = await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      this.logger.error(
        `Failed to read token: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.token = null;
    }
    return this.token;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      this.logger.error(
        `Failed to persist token: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async clear(): Promise<void> {
    this.token = null;
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      this.logger.error(
        `Failed to clear token: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
