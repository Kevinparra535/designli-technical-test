# Skills

Machine-readable instruction sets that teach an LLM (Claude, Cursor, Copilot) to
generate code compliant with this app's Clean Architecture + MVVM stack. Each
skill is structured with **XML tags** so the model can separate role, context,
rules, instructions, examples, and output format unambiguously — the
prompt-engineering pattern recommended by Anthropic for clarity, precision, and
injection resistance.

| Skill | Purpose |
| --- | --- |
| [clean-architecture-mvvm.md](./clean-architecture-mvvm.md) | The architecture, layers, and 8 non-negotiable rules. Start here. |
| [feature-scaffold.md](./feature-scaffold.md) | Scaffold a full vertical slice (entity → model → repo → use cases → VM → screen → DI). |
| [viewmodel-pattern.md](./viewmodel-pattern.md) | The canonical MobX ViewModel shape (`ICalls`, `updateLoadingState`, `handleError`). |
| [design-system.md](./design-system.md) | Token-driven, presentational UI primitives. |
| [pr-checklist.md](./pr-checklist.md) | Architecture-compliance review gate before merge. |

## XML tag convention used by every skill

```xml
<skill name="...">
  <role>who the model is acting as</role>
  <context>where this fits in the codebase</context>
  <rules><rule id="1">...</rule></rules>
  <instructions>ordered steps</instructions>
  <examples><example><code><![CDATA[ ... ]]></code></example></examples>
  <output_format>exact shape of the response</output_format>
  <related><skill>...</skill></related>
</skill>
```

Reference architecture: https://github.com/Kevinparra535/clean-architecture-stack
