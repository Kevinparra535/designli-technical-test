# `data/models`

Transport models (DTOs) that mirror the **backend** shape, including its naming
(`full_name`, `created_at`, snake_case, etc.).

Each model exposes:

- a `fromJson(json)` factory, and
- a `toDomain()` method (often via prototype augmentation) that renames/maps the
  DTO into a domain entity.

Models never leak past the repository — the repo always returns domain entities.

Example file: `ClientModel.ts`.
