// src/config/types.ts
//
// Inversify binding identifiers. Every injectable thing gets a Symbol here.
//
// Rules (see skills/feature-scaffold.md):
// - Always use Symbol.for('Name') — never a bare string.
// - Group by layer: Services (data) → Repositories (domain contract) →
//   UseCases (domain) → ViewModels (ui).
//
// Empty scaffold: add entries as you scaffold each feature. Example shape:
//
//   ClientService:        Symbol.for('ClientService'),        // data
//   ClientRepository:     Symbol.for('ClientRepository'),     // domain contract
//   GetAllClientUseCase:  Symbol.for('GetAllClientUseCase'),  // domain
//   ClientsViewModel:     Symbol.for('ClientsViewModel'),     // ui

export const TYPES = {
  // data — network managers (raw infra)
  HttpManager: Symbol.for('HttpManager'),
  FinnhubManager: Symbol.for('FinnhubManager'),
  WebhookManager: Symbol.for('WebhookManager'),
  PushNotificationManager: Symbol.for('PushNotificationManager'),
  NotificationApiManager: Symbol.for('NotificationApiManager'),
  FinnhubSocketManager: Symbol.for('FinnhubSocketManager'),

  // domain — services (contracts; impl in data, wraps a manager + maps to domain)
  StockService: Symbol.for('StockService'),
  StockAlertService: Symbol.for('StockAlertService'),
  NotificationService: Symbol.for('NotificationService'),
  RealtimePriceService: Symbol.for('RealtimePriceService'),

  // domain — repositories (contracts; impl in data, delegates to a service)
  StockRepository: Symbol.for('StockRepository'),
  StockAlertRepository: Symbol.for('StockAlertRepository'),
  NotificationRepository: Symbol.for('NotificationRepository'),
  RealtimePriceRepository: Symbol.for('RealtimePriceRepository'),

  // domain — useCases
  GetStockListUseCase: Symbol.for('GetStockListUseCase'),
  CreateStockAlertUseCase: Symbol.for('CreateStockAlertUseCase'),
  RegisterPushNotificationsUseCase: Symbol.for(
    'RegisterPushNotificationsUseCase',
  ),
  SubscribeToPricesUseCase: Symbol.for('SubscribeToPricesUseCase'),

  // ui — viewModels
  HomeViewModel: Symbol.for('HomeViewModel'),
  CreateStockAlertViewModel: Symbol.for('CreateStockAlertViewModel'),
} as const;
