# `data/repositories`

Concrete repository **implementations** (`{Entity}RepositoryImpl`) that satisfy
the interface in [`domain/repositories`](../../domain/repositories).

Rules:

- Receives a service via constructor injection (`@inject`).
- Calls the service to get models, then `.toDomain()` before returning.
- **Never** returns a raw model / bare JSON to its caller.
- Bound as a **singleton** in `config/di.ts`.

Example file: `ClientRepositoryImpl.ts`.
