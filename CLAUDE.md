# CLAUDE.md

Guidance for Claude Code (and any LLM) working in this repository. This file is
the hub: [AGENTS.md](./AGENTS.md) points here, and this file points to the
**skills** that carry the detailed, enforceable rules.

## Project

Expo + TypeScript app built on a **Clean Architecture + MVVM** stack
(MobX + Inversify). Strict one-way dependency flow:

```
ui → viewModel → useCase → domain (contracts)   ·   data implements the contracts
```

Source map (`@/*` → `src/*`): see [src/README.md](./src/README.md) for the full
layer table and the 7 architectural rules.

## Skills — read before writing code

These are the source of truth for how to write code here. Load the relevant one
before generating or reviewing changes:

- **[skills/clean-architecture-mvvm.md](./skills/clean-architecture-mvvm.md)** — architecture, layers, the 8 non-negotiable rules. **Start here.**
- **[skills/feature-scaffold.md](./skills/feature-scaffold.md)** — scaffold a full vertical slice across every layer + DI.
- **[skills/viewmodel-pattern.md](./skills/viewmodel-pattern.md)** — the canonical MobX ViewModel shape.
- **[skills/design-system.md](./skills/design-system.md)** — token-driven, presentational UI primitives.
- **[skills/pr-checklist.md](./skills/pr-checklist.md)** — architecture-compliance gate to self-check before finishing.

Index: [skills/README.md](./skills/README.md).

## Working agreement

- Pick the right layer for a change and stay in it; never import "upward"
  (domain/ui must not import from data).
- Register every new injectable in `src/config/types.ts` and `src/config/di.ts`
  with the correct scope (services/repos = singleton, use cases/VMs = transient).
- Before declaring a task done, run `npx tsc --noEmit` and walk the
  [PR checklist](./skills/pr-checklist.md).

## Commands

```bash
npm run start     # expo dev server
npm run android   # run on Android
npm run ios       # run on iOS (macOS)
npm run web       # run in browser
npx tsc --noEmit  # typecheck
```

## Expo version note

This app targets a specific Expo SDK. Read the versioned docs before using Expo
APIs: https://docs.expo.dev/versions/v56.0.0/
