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

import { TYPES } from '@/config/types';

import { AxiosHttpManager, HttpManager } from '@/data/network/axiosManager';
import {
  FinnhubManager,
  FinnhubManagerImpl,
} from '@/data/network/finnhubManager';
import {
  NotificationApiManager,
  NotificationApiManagerImpl,
} from '@/data/network/notificationApiManager';
import {
  ExpoPushNotificationManager,
  PushNotificationManager,
} from '@/data/network/pushNotificationManager';
import {
  WebhookManager,
  WebhookManagerImpl,
} from '@/data/network/webhookManager';

import { NotificationServiceImpl } from '@/data/services/NotificationServiceImpl';
import { StockAlertServiceImpl } from '@/data/services/StockAlertServiceImpl';
import { StockServiceImpl } from '@/data/services/StockServiceImpl';

import { NotificationRepositoryImpl } from '@/data/repositories/NotificationRepositoryImpl';
import { StockAlertRepositoryImpl } from '@/data/repositories/StockAlertRepositoryImpl';
import { StockRepositoryImpl } from '@/data/repositories/StockRepositoryImpl';

import type { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import type { StockAlertRepository } from '@/domain/repositories/StockAlertRepository';
import type { StockRepository } from '@/domain/repositories/StockRepository';
import type { NotificationService } from '@/domain/services/NotificationService';
import type { StockAlertService } from '@/domain/services/StockAlertService';
import type { StockService } from '@/domain/services/StockService';

import { CreateStockAlertUseCase } from '@/domain/useCases/CreateStockAlertUseCase';
import { GetStockListUseCase } from '@/domain/useCases/GetStockListUseCase';
import { RegisterPushNotificationsUseCase } from '@/domain/useCases/RegisterPushNotificationsUseCase';

import { CreateStockAlertViewModel } from '@/ui/screens/CreateStockAlert/CreateStockAlertViewModel';
import { HomeViewModel } from '@/ui/screens/Home/HomeViewModel';

export const container = new Container();

// Data services
container
  .bind<HttpManager>(TYPES.HttpManager)
  .to(AxiosHttpManager)
  .inSingletonScope();

container
  .bind<FinnhubManager>(TYPES.FinnhubManager)
  .to(FinnhubManagerImpl)
  .inSingletonScope();

container
  .bind<WebhookManager>(TYPES.WebhookManager)
  .to(WebhookManagerImpl)
  .inSingletonScope();

container
  .bind<PushNotificationManager>(TYPES.PushNotificationManager)
  .to(ExpoPushNotificationManager)
  .inSingletonScope();

container
  .bind<NotificationApiManager>(TYPES.NotificationApiManager)
  .to(NotificationApiManagerImpl)
  .inSingletonScope();

// Services (domain contract → data impl; wraps a manager, maps to domain)
container
  .bind<StockService>(TYPES.StockService)
  .to(StockServiceImpl)
  .inSingletonScope();

container
  .bind<StockAlertService>(TYPES.StockAlertService)
  .to(StockAlertServiceImpl)
  .inSingletonScope();

container
  .bind<NotificationService>(TYPES.NotificationService)
  .to(NotificationServiceImpl)
  .inSingletonScope();

// Repositories (domain contract → data impl; delegates to a service)
container
  .bind<StockRepository>(TYPES.StockRepository)
  .to(StockRepositoryImpl)
  .inSingletonScope();

container
  .bind<StockAlertRepository>(TYPES.StockAlertRepository)
  .to(StockAlertRepositoryImpl)
  .inSingletonScope();

container
  .bind<NotificationRepository>(TYPES.NotificationRepository)
  .to(NotificationRepositoryImpl)
  .inSingletonScope();

// UseCases
container
  .bind<GetStockListUseCase>(TYPES.GetStockListUseCase)
  .to(GetStockListUseCase);

container
  .bind<CreateStockAlertUseCase>(TYPES.CreateStockAlertUseCase)
  .to(CreateStockAlertUseCase);

container
  .bind<RegisterPushNotificationsUseCase>(
    TYPES.RegisterPushNotificationsUseCase,
  )
  .to(RegisterPushNotificationsUseCase);

// UI ViewModels
container.bind<HomeViewModel>(TYPES.HomeViewModel).to(HomeViewModel);
container
  .bind<CreateStockAlertViewModel>(TYPES.CreateStockAlertViewModel)
  .to(CreateStockAlertViewModel);
