# `domain/entities`

Business entities as **classes** (not interfaces). Pure data carriers with no
framework or infrastructure imports.

Conventions (see `src/domain/entities/Stock.ts`):

- A local `export interface ConstructorParams` (named EXACTLY that), with the
  fields, an optional `error?: string | null`, and a `[key: string]: any` index
  signature for untyped backend fields.
- The class declares each field with an **indexed-access type**
  (`public id: ConstructorParams['id'];`) and also carries `[key: string]: any`.
- The constructor takes `(model: ConstructorParams)` and assigns each field
  **explicitly** (`this.id = model.id;`). Do NOT use `Object.assign`.
- Pure data class — no domain methods.

Example file: `Stock.ts`.
