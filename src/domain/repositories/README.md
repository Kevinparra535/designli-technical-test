# `domain/repositories`

Repository **interfaces** (abstract contracts) — the boundary between domain and
data. They are written in terms of domain entities, never DTOs.

The concrete implementation lives in [`data/repositories`](../../data/repositories).

Example file: `ClientRepository.ts` (interface only).
