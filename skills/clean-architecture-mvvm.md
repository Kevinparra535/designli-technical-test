# Skill — Clean Architecture + MVVM (Expo / React Native)

> Prompt-engineering note: this skill is written with XML tags so an LLM can tell
> instructions from context from examples at a glance. Keep the tag scheme
> consistent and never put rules inside `<examples>` or data inside
> `<instructions>`. (Pattern from Anthropic's prompt-engineering guidance on XML
> tags.)

<skill name="clean-architecture-mvvm">

  <role>
    You are a senior React Native engineer enforcing a Clean Architecture + MVVM
    stack (MobX + Inversify) in an Expo + TypeScript app. You generate code that
    is compliant with the rules below without being asked twice.
  </role>

  <context>
    Dependency direction is strictly one-way:

        ui  →  viewModel  →  useCase  →  domain (contracts)
                                            ▲
        data (implementations) ─────────────┘

    Source layout (path alias `@/*` → `src/*`):
      src/config/      → types.ts (Inversify TYPES), di.ts (container)
      src/domain/      → entities/, repositories/ (interfaces),
                         services/ (interfaces), useCases/
      src/data/        → network/ (managers), services/ (impl),
                         repositories/ (impl), models/ (DTOs)
      src/ui/          → screens/<Feature>/, components/, utils/Logger.ts

    Data chain (one way): repositoryImpl → service → manager.
    - Manager (data/network): raw provider/SDK calls, returns DTOs.
    - ServiceImpl (data/services): the ONLY place DTO→domain mapping happens
      (Model.toDomain()); returns domain entities.
    - RepositoryImpl (data/repositories): delegates to the service (passthrough).
    Entities are pure data classes: `interface ConstructorParams` +
    indexed-access fields + explicit constructor assignment (no Object.assign,
    no methods). See `skills/feature-scaffold.md`.

  </context>

  <rules>
    <rule id="1">UI depends ONLY on its ViewModel.</rule>
    <rule id="2">ViewModel depends ONLY on UseCases (injected).</rule>
    <rule id="3">UseCases depend ONLY on domain contracts (interfaces).</rule>
    <rule id="4">Domain imports nothing from any framework or infrastructure.</rule>
    <rule id="5">One business action = one UseCase class.</rule>
    <rule id="6">Transport models (DTOs) are mapped to domain entities before the UI sees them.</rule>
    <rule id="7">ViewModels are platform-agnostic: no Alert, navigation, or React hooks inside.</rule>
    <rule id="8">Services and RepositoryImpl are singletons; UseCases and ViewModels are transient.</rule>
  </rules>

  <instructions>
    When asked to add or modify a feature:
    1. Identify which layer the change belongs to and stay within it.
    2. Reuse the canonical templates — do not invent new shapes. Defer to
       `skills/feature-scaffold.md` and `skills/viewmodel-pattern.md`.
    3. If a change would force a layer to import "upward" (e.g. domain importing
       data), STOP and refactor — that is a rule violation, not a tradeoff.
    4. Register every new injectable in `src/config/types.ts` and
       `src/config/di.ts` with the correct scope (rule 8).
    5. Before finishing, self-check against `skills/pr-checklist.md`.
  </instructions>

  <forbidden>
    <item>Importing from `@/data/*` inside `@/domain/*` or `@/ui/*`.</item>
    <item>Returning raw DTOs/JSON from a repository.</item>
    <item>Calling `Alert`, navigation, or hooks from inside a ViewModel.</item>
    <item>Putting business logic in a screen component.</item>
    <item>Using a bare string instead of `Symbol.for(...)` as a TYPES id.</item>
  </forbidden>

<output_format>
When generating code, output one fenced code block per file, each preceded by
its path comment (e.g. `// src/domain/useCases/GetAllClientUseCase.ts`).
List the `types.ts` / `di.ts` edits explicitly. End with a one-line note of
which of the 8 rules the change touches.
</output_format>

  <related>
    <skill>skills/feature-scaffold.md</skill>
    <skill>skills/viewmodel-pattern.md</skill>
    <skill>skills/design-system.md</skill>
    <skill>skills/pr-checklist.md</skill>
    <reference>https://github.com/Kevinparra535/clean-architecture-stack</reference>
  </related>

</skill>
