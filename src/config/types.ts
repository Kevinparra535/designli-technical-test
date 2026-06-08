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

export const TYPES = {} as const;
