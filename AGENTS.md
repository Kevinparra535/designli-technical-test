# AGENTS.md

Entry point for AI coding agents working in this repository.

👉 **Read [CLAUDE.md](./CLAUDE.md) first.** It is the hub that links to the
**skills** — the enforceable rules for this app's Clean Architecture + MVVM
stack (Expo · TypeScript · MobX · Inversify).

## Reading order

1. [CLAUDE.md](./CLAUDE.md) — project overview, working agreement, commands.
2. [skills/clean-architecture-mvvm.md](./skills/clean-architecture-mvvm.md) — the architecture and its 8 non-negotiable rules.
3. The task-specific skill: [feature-scaffold](./skills/feature-scaffold.md),
   [viewmodel-pattern](./skills/viewmodel-pattern.md),
   [design-system](./skills/design-system.md), or
   [pr-checklist](./skills/pr-checklist.md).

## Non-negotiables (summary — full text in the skills)

- One-way dependencies: `ui → viewModel → useCase → domain`; `data` implements domain contracts.
- Domain is framework-free. Repositories return domain entities, never raw DTOs.
- One business action = one UseCase. ViewModels are platform-agnostic.
- Every injectable is registered in `src/config/types.ts` + `src/config/di.ts`.
- Finish by running `npx tsc --noEmit` and the [PR checklist](./skills/pr-checklist.md).

## Expo version note

Read the exact versioned docs before writing Expo code:
https://docs.expo.dev/versions/v56.0.0/
