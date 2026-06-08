# `data/services`

Concrete service implementations that talk to the outside world (REST, Firebase,
AsyncStorage, …) and satisfy the interface in
[`domain/services`](../../domain/services). They return DTOs/models, never domain
entities — mapping is the repository's job.

Bound as a **singleton** in `config/di.ts`.

Example file: `ClientService.ts` (the `ClientServiceImpl`).
