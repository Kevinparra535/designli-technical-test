# Skill — HTTP Client Manager (Peticiones Centralizadas)

<skill name="http-client-manager">

  <role>
    Crear un gestor centralizado de peticiones HTTP que actúe como punto único de 
    entrada para todas las llamadas a API, manteniendo la inyección de dependencias 
    y el principio de responsabilidad única.
  </role>

  <context>
    El HttpClient es un **singleton** en la capa `data/services`. Los servicios de 
    datos específicos lo inyectan para hacer peticiones. El HttpClient:
    - Encapsula la lógica de configuración (headers, timeout, base URL, etc.)
    - Maneja errores de red genéricos
    - Permite logging centralizado
    - NO mapea DTOs a entidades (eso es responsabilidad del servicio específico)
  </context>

  <architecture>
    ```
    HttpClient (singleton, data/services)
              ↓
    ClientService, ProductService, etc. (singletons, data/services)
              ↓
    ClientRepository, ProductRepository (data/repositories)
              ↓
    UseCases (domain)
    ```
  </architecture>

  <instructions>

    ### 1. Crear el contrato del HttpClient

    ```typescript
    // src/domain/services/HttpClientService.ts
    export interface HttpClientService {
      get<T>(url: string, options?: RequestOptions): Promise<T>;
      post<T>(url: string, data: unknown, options?: RequestOptions): Promise<T>;
      put<T>(url: string, data: unknown, options?: RequestOptions): Promise<T>;
      patch<T>(url: string, data: unknown, options?: RequestOptions): Promise<T>;
      delete<T>(url: string, options?: RequestOptions): Promise<T>;
    }

    export interface RequestOptions {
      headers?: Record<string, string>;
      timeout?: number;
      baseURL?: string;
    }
    ```

    ### 2. Implementar el HttpClient

    Usa `expo-fetch` o `axios` (instala con `npm install axios` o usa `fetch` nativo).

    ```typescript
    // src/data/services/HttpClientImpl.ts
    import { injectable } from 'inversify';
    import type { HttpClientService, RequestOptions } from '@/domain/services/HttpClientService';
    import Logger from '@/ui/utils/Logger';

    @injectable()
    export class HttpClientImpl implements HttpClientService {
      private readonly baseURL = 'https://api.example.com';
      private readonly timeout = 10000; // ms
      private logger = new Logger('HttpClient');

      private async request<T>(
        method: string,
        url: string,
        data?: unknown,
        options?: RequestOptions,
      ): Promise<T> {
        const fullUrl = `${options?.baseURL || this.baseURL}${url}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), options?.timeout || this.timeout);

        try {
          const response = await fetch(fullUrl, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return (await response.json()) as T;
        } catch (error) {
          this.logger.error(`${method} ${url}:`, error);
          throw error;
        } finally {
          clearTimeout(timer);
        }
      }

      async get<T>(url: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('GET', url, undefined, options);
      }

      async post<T>(url: string, data: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>('POST', url, data, options);
      }

      async put<T>(url: string, data: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>('PUT', url, data, options);
      }

      async patch<T>(url: string, data: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>('PATCH', url, data, options);
      }

      async delete<T>(url: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('DELETE', url, undefined, options);
      }
    }
    ```

    ### 3. Registrar en DI

    **types.ts:**
    ```typescript
    export const TYPES = {
      HttpClientService: Symbol.for('HttpClientService'),
    } as const;
    ```

    **di.ts:**
    ```typescript
    import { HttpClientImpl } from '@/data/services/HttpClientImpl';
    import type { HttpClientService } from '@/domain/services/HttpClientService';

    container.bind<HttpClientService>(TYPES.HttpClientService)
      .to(HttpClientImpl).inSingletonScope();
    ```

    ### 4. Usar en un Servicio de Datos

    ```typescript
    // src/data/services/ClientService.ts
    import { inject, injectable } from 'inversify';
    import { TYPES } from '@/config/types';
    import type { HttpClientService } from '@/domain/services/HttpClientService';

    @injectable()
    export class ClientService {
      constructor(
        @inject(TYPES.HttpClientService)
        private readonly httpClient: HttpClientService,
      ) {}

      async getAll() {
        return this.httpClient.get<ClientModel[]>('/clients');
      }

      async getById(id: string) {
        return this.httpClient.get<ClientModel>(`/clients/${id}`);
      }

      async create(data: ClientModel) {
        return this.httpClient.post<ClientModel>('/clients', data);
      }
    }
    ```

  </instructions>

  <rules>
    <rule id="1">HttpClient es SINGLETON; vive en `data/services`.</rule>
    <rule id="2">Nunca devuelve entidades de dominio; devuelve DTOs/modelos.</rule>
    <rule id="3">El servicio específico (ej: ClientService) mapea DTOs a entidades.</rule>
    <rule id="4">Maneja errores de red genéricos; lanza excepciones específicas para casos de negocio.</rule>
    <rule id="5">Logging centralizado a través de `@/ui/utils/Logger`.</rule>
  </rules>

  <related>
    <skill>skills/clean-architecture-mvvm.md</skill>
    <skill>skills/feature-scaffold.md</skill>
  </related>

</skill>
