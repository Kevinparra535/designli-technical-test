# `domain/services`

Service **interfaces** (contracts), expressed in terms of domain entities. A
repository depends on a service; the data-layer impl
([`data/services`](../../data/services)) wraps a Manager and does the DTO→domain
mapping.

Chain: `useCase → repository → service → manager`. UseCases never see services
directly (they depend on repositories) — but both repository and service are
domain contracts.

Example file: `StockService.ts` (interface only).
