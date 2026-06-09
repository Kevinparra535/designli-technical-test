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

import {
  AuthApiManager,
  AuthApiManagerImpl,
} from '@/data/network/authApiManager';
import { AxiosHttpManager, HttpManager } from '@/data/network/axiosManager';
import {
  FinnhubManager,
  FinnhubManagerImpl,
} from '@/data/network/finnhubManager';
import {
  FinnhubSocketManager,
  FinnhubSocketManagerImpl,
} from '@/data/network/finnhubSocketManager';
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

import { AuthServiceImpl } from '@/data/services/AuthServiceImpl';
import { NotificationServiceImpl } from '@/data/services/NotificationServiceImpl';
import { RealtimePriceServiceImpl } from '@/data/services/RealtimePriceServiceImpl';
import { StockAlertServiceImpl } from '@/data/services/StockAlertServiceImpl';
import { StockServiceImpl } from '@/data/services/StockServiceImpl';

import { NotificationRepositoryImpl } from '@/data/repositories/NotificationRepositoryImpl';
import { RealtimePriceRepositoryImpl } from '@/data/repositories/RealtimePriceRepositoryImpl';
import { SessionRepositoryImpl } from '@/data/repositories/SessionRepositoryImpl';
import { StockAlertRepositoryImpl } from '@/data/repositories/StockAlertRepositoryImpl';
import { StockRepositoryImpl } from '@/data/repositories/StockRepositoryImpl';

import type { NotificationRepository } from '@/domain/repositories/NotificationRepository';
import type { RealtimePriceRepository } from '@/domain/repositories/RealtimePriceRepository';
import type { SessionRepository } from '@/domain/repositories/SessionRepository';
import type { StockAlertRepository } from '@/domain/repositories/StockAlertRepository';
import type { StockRepository } from '@/domain/repositories/StockRepository';
import type { AuthService } from '@/domain/services/AuthService';
import type { NotificationService } from '@/domain/services/NotificationService';
import type { RealtimePriceService } from '@/domain/services/RealtimePriceService';
import type { StockAlertService } from '@/domain/services/StockAlertService';
import type { StockService } from '@/domain/services/StockService';

import { CheckActiveSessionUseCase } from '@/domain/useCases/CheckActiveSessionUseCase';
import { CreateStockAlertUseCase } from '@/domain/useCases/CreateStockAlertUseCase';
import { DeleteStockAlertUseCase } from '@/domain/useCases/DeleteStockAlertUseCase';
import { GetStockAlertsUseCase } from '@/domain/useCases/GetStockAlertsUseCase';
import { GetStockDetailUseCase } from '@/domain/useCases/GetStockDetailUseCase';
import { GetStockListUseCase } from '@/domain/useCases/GetStockListUseCase';
import { LoginUseCase } from '@/domain/useCases/LoginUseCase';
import { LogoutUseCase } from '@/domain/useCases/LogoutUseCase';
import { RegisterPushNotificationsUseCase } from '@/domain/useCases/RegisterPushNotificationsUseCase';
import { SubscribeToPricesUseCase } from '@/domain/useCases/SubscribeToPricesUseCase';

import { AlertsListViewModel } from '@/ui/screens/AlertsList/AlertsListViewModel';
import { CreateStockAlertViewModel } from '@/ui/screens/CreateStockAlert/CreateStockAlertViewModel';
import { HomeViewModel } from '@/ui/screens/Home/HomeViewModel';
import { SessionViewModel } from '@/ui/screens/Login/SessionViewModel';
import { StockDetailViewModel } from '@/ui/screens/StockDetail/StockDetailViewModel';

import {
  AuthTokenStore,
  SecureAuthTokenStore,
} from '@/data/storage/authTokenStore';

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

container
  .bind<FinnhubSocketManager>(TYPES.FinnhubSocketManager)
  .to(FinnhubSocketManagerImpl)
  .inSingletonScope();

container
  .bind<AuthApiManager>(TYPES.AuthApiManager)
  .to(AuthApiManagerImpl)
  .inSingletonScope();

// Storage
container
  .bind<AuthTokenStore>(TYPES.AuthTokenStore)
  .to(SecureAuthTokenStore)
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

container
  .bind<RealtimePriceService>(TYPES.RealtimePriceService)
  .to(RealtimePriceServiceImpl)
  .inSingletonScope();

container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthServiceImpl)
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

container
  .bind<RealtimePriceRepository>(TYPES.RealtimePriceRepository)
  .to(RealtimePriceRepositoryImpl)
  .inSingletonScope();

container
  .bind<SessionRepository>(TYPES.SessionRepository)
  .to(SessionRepositoryImpl)
  .inSingletonScope();

// UseCases
container
  .bind<GetStockListUseCase>(TYPES.GetStockListUseCase)
  .to(GetStockListUseCase);

container
  .bind<GetStockDetailUseCase>(TYPES.GetStockDetailUseCase)
  .to(GetStockDetailUseCase);

container
  .bind<CreateStockAlertUseCase>(TYPES.CreateStockAlertUseCase)
  .to(CreateStockAlertUseCase);

container
  .bind<GetStockAlertsUseCase>(TYPES.GetStockAlertsUseCase)
  .to(GetStockAlertsUseCase);

container
  .bind<DeleteStockAlertUseCase>(TYPES.DeleteStockAlertUseCase)
  .to(DeleteStockAlertUseCase);

container
  .bind<RegisterPushNotificationsUseCase>(
    TYPES.RegisterPushNotificationsUseCase,
  )
  .to(RegisterPushNotificationsUseCase);

container
  .bind<SubscribeToPricesUseCase>(TYPES.SubscribeToPricesUseCase)
  .to(SubscribeToPricesUseCase);

container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
container
  .bind<CheckActiveSessionUseCase>(TYPES.CheckActiveSessionUseCase)
  .to(CheckActiveSessionUseCase);
container.bind<LogoutUseCase>(TYPES.LogoutUseCase).to(LogoutUseCase);

// UI ViewModels
container.bind<HomeViewModel>(TYPES.HomeViewModel).to(HomeViewModel);
container
  .bind<CreateStockAlertViewModel>(TYPES.CreateStockAlertViewModel)
  .to(CreateStockAlertViewModel);
container
  .bind<AlertsListViewModel>(TYPES.AlertsListViewModel)
  .to(AlertsListViewModel);
container
  .bind<StockDetailViewModel>(TYPES.StockDetailViewModel)
  .to(StockDetailViewModel);

// Session is app-global → singleton (the rare global-VM exception).
container
  .bind<SessionViewModel>(TYPES.SessionViewModel)
  .to(SessionViewModel)
  .inSingletonScope();
