# `data/repositories`

Concrete repository **implementations** (`{Entity}RepositoryImpl`) that satisfy
the interface in [`domain/repositories`](../../domain/repositories).

The repository is the **top link** of the data chain
(`RepositoryImpl → Service → Manager`):

- Injects a **Service** from [`data/services`](../services) (`private service`).
- **Delegates** to it — passthrough that returns the domain entities the service
  already produced. NO DTO mapping here (that lives in the service).
- **Never** returns a raw model / bare JSON to its caller.
- Bound as a **singleton** in `config/di.ts`.

Example file: `StockRepositoryImpl.ts`.
