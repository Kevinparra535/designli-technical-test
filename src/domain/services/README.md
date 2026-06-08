# `domain/services`

Service **interfaces** that abstract transport concerns (HTTP, Firebase, storage)
behind a contract the data layer implements. UseCases never see these directly —
they depend on repositories, which depend on services.

Example file: `ClientService.ts` (interface only).
