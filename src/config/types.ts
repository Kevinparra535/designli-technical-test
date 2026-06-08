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

  // domain — services (contracts; impl in data, wraps a manager + maps to domain)
  StockService: Symbol.for('StockService'),

  // domain — repositories (contracts; impl in data, delegates to a service)
  StockRepository: Symbol.for('StockRepository'),

  // domain — useCases
  GetStockListUseCase: Symbol.for('GetStockListUseCase'),

  // ui — viewModels
  HomeViewModel: Symbol.for('HomeViewModel'),
} as const;
