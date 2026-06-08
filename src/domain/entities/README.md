# `domain/entities`

Business entities as **classes** (not interfaces) so they can carry domain
methods. No framework or infrastructure imports.

Conventions:

- A `XxxConstructorParams` type for the constructor.
- An index signature `[key: string]: any` for untyped backend fields (ADR 003).
- `Object.assign(this, params)` at the end of the constructor.
- Domain helpers live here (e.g. `displayName()`, `isCorporateEmail()`).

Example file: `Client.ts`.
