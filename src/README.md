# `src/` — Clean Architecture + MVVM

Dependency direction is **one-way** and never violated:

```
ui  ──▶  viewModel  ──▶  useCase  ──▶  domain (contracts)
                                          ▲
data (implementations) ───────────────────┘  (implements the contracts)
```

| Layer | Folder | Depends on | May NOT import |
| --- | --- | --- | --- |
| UI | `ui/` | ViewModels | data, services |
| ViewModel | `ui/screens/<Feature>/<Feature>ViewModel.ts` | UseCases | navigation, alerts, hooks |
| UseCase | `domain/useCases/` | domain contracts (interfaces) | data implementations |
| Domain | `domain/` | nothing (pure) | any framework |
| Data | `data/` | domain contracts (to implement them) | ui, viewModel |
| Config | `config/` | everything (composition root) | — |

## The 7 non-negotiable rules

1. UI depends **only** on ViewModel.
2. ViewModel depends **only** on UseCases.
3. UseCases depend **only** on domain contracts (interfaces).
4. Domain imports nothing from frameworks.
5. One business action = one UseCase class.
6. Transport models (DTOs) are **always** mapped to domain entities before the UI sees them.
7. ViewModels stay platform-agnostic (no `Alert`, navigation, or React hooks inside).

See the skills in [`/skills`](../skills) for the canonical templates and the
feature-scaffold checklist. Architecture reference:
https://github.com/Kevinparra535/clean-architecture-stack
