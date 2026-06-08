# `data/services`

Concrete service implementations (`{Entity}ServiceImpl`) that satisfy the
interface in [`domain/services`](../../domain/services).

A service is the **middle link** of the data chain
(`RepositoryImpl → Service → Manager`):

- Injects a **Manager** from [`data/network`](../network) (`private service`) for
  the raw provider/SDK calls.
- Is the **single place** DTO→domain mapping happens —
  `{Entity}Model.fromJsonList(res).map((m) => m.toDomain())`.
- Returns **domain entities**, never raw DTOs.
- Bound as a **singleton** in `config/di.ts`.

Example file: `StockServiceImpl.ts`.
