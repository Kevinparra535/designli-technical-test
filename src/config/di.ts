// src/config/di.ts
//
// Inversify container bootstrap — the single composition root of the app.
//
// reflect-metadata (the decorator polyfill) is loaded once by the app entry
// (index.ts) and, in tests, via your jest `setupFiles`. It must be evaluated
// before any @injectable/@inject class imported here is constructed.
//
// Binding scopes (non-negotiable):
// - Services & RepositoryImpl → .inSingletonScope()
// - UseCases                  → transient (default)
// - ViewModels                → transient (default)
//
// Empty scaffold: register bindings as features are added. Example:
//
//   container.bind<ClientService>(TYPES.ClientService)
//     .to(ClientServiceImpl).inSingletonScope();
//   container.bind<ClientRepository>(TYPES.ClientRepository)
//     .to(ClientRepositoryImpl).inSingletonScope();
//   container.bind<GetAllClientUseCase>(TYPES.GetAllClientUseCase)
//     .to(GetAllClientUseCase);
//   container.bind<ClientsViewModel>(TYPES.ClientsViewModel)
//     .to(ClientsViewModel);
//
// Screens resolve ViewModels with container.get(TYPES.X). Tests do NOT use the
// container — they instantiate the class directly with mocked dependencies.

import { Container } from 'inversify';

import { AxiosHttpManager, HttpManager } from '@/data/network/axiosManager';

import { TYPES } from './types';

export const container = new Container();

container
  .bind<HttpManager>(TYPES.HttpManager)
  .to(AxiosHttpManager)
  .inSingletonScope();
