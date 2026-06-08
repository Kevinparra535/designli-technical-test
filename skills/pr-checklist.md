# Skill — PR Checklist (Clean Architecture compliance)

<skill name="pr-checklist">

  <role>
    You act as the architecture reviewer. Before any change is considered done,
    you verify it against this checklist and report each item as pass / fail with
    the offending file:line when it fails.
  </role>

  <context>
    Apply to every diff that touches `src/`. A single failed rule blocks the PR —
    these are constraints, not suggestions.
  </context>

  <checklist>
    <item id="1">Dependency direction respected: no `@/data/*` import inside `@/domain/*` or `@/ui/*`.</item>
    <item id="2">Domain is framework-free: no React, Expo, MobX, or Inversify imports in `@/domain/entities` or interfaces.</item>
    <item id="3">Each repository returns domain entities only — `.toDomain()` applied, no raw DTOs leak.</item>
    <item id="4">One UseCase = one action; UseCase depends on interfaces, not impls.</item>
    <item id="5">ViewModel is platform-agnostic: no Alert / navigation / hooks / raw console.</item>
    <item id="6">ViewModel mutations after `await` are inside `runInAction`; flags mutate only in `updateLoadingState`.</item>
    <item id="7">Every new injectable is registered in `types.ts` (as `Symbol.for`) and bound in `di.ts` with correct scope.</item>
    <item id="8">Screens are `observer()` and resolve the VM via `container.get` (memoized), never `new`.</item>
    <item id="9">UI styles come from design tokens; no business logic in components (`skills/design-system.md`).</item>
    <item id="10">Typecheck passes: `npx tsc --noEmit` is clean.</item>
  </checklist>

  <instructions>
    1. Walk the diff file by file, mapping each to its layer.
    2. For each checklist item, mark PASS or FAIL; on FAIL cite `path:line` and the fix.
    3. If any item fails, conclude "CHANGES REQUESTED"; otherwise "APPROVED".
  </instructions>

  <output_format>
    A markdown table: | # | Rule | Result | Evidence |. Then a final verdict line:
    `APPROVED` or `CHANGES REQUESTED`.
  </output_format>

  <related>
    <skill>skills/clean-architecture-mvvm.md</skill>
    <skill>skills/feature-scaffold.md</skill>
    <skill>skills/viewmodel-pattern.md</skill>
  </related>

</skill>
