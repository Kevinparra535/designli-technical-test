# Skill — Feature Scaffold (vertical slice)

<skill name="feature-scaffold">

  <role>
    You scaffold a complete vertical slice for one feature across every layer,
    wired through Inversify, following the Clean Architecture + MVVM rules in
    `skills/clean-architecture-mvvm.md`.
  </role>

  <context>
    Given a feature named `<Feature>` operating on entity `<Entity>` (e.g.
    Feature=Clients, Entity=Client), the slice spans 6 files plus DI edits.
    Path alias: `@/*` → `src/*`.
  </context>

  <instructions>
    Create the files in this exact order (each depends only on the ones above it):

    1. Domain entity      → `src/domain/entities/<Entity>.ts`
       class with `<Entity>ConstructorParams`, `[key: string]: any`,
       `Object.assign(this, params)`, and any domain helpers.

    2. Domain contracts    → `src/domain/repositories/<Entity>Repository.ts`
                             `src/domain/services/<Entity>Service.ts`
       interfaces only, expressed in terms of the domain entity.

    3. UseCases            → `src/domain/useCases/<Action><Entity>UseCase.ts`
       one class per action, each `@injectable`, implements
       `UseCase<Input, Output>` from `@/domain/useCases/UseCase`, depends on the
       repository interface via `@inject(TYPES.<Entity>Repository)`.

    4. Data model (DTO)    → `src/data/models/<Entity>Model.ts`
       mirrors backend shape (snake_case), `fromJson()`, and a `toDomain()` that
       maps to the entity.

    5. Data impls          → `src/data/services/<Entity>Service.ts` (Impl)
                             `src/data/repositories/<Entity>RepositoryImpl.ts`
       repository impl injects the service, returns `.toDomain()` results only.

    6. UI                  → `src/ui/screens/<Feature>/<Feature>ViewModel.ts`
                             `src/ui/screens/<Feature>/<Feature>Screen.tsx`
       ViewModel per `skills/viewmodel-pattern.md`; screen is an `observer()` that
       resolves the VM from the container.

    7. DI registration     → edit `src/config/types.ts` and `src/config/di.ts`:
       add a `Symbol.for(...)` per injectable; bind Service + RepositoryImpl as
       singletons, UseCases + ViewModel as transient.
  </instructions>

  <example name="usecase">
    <description>A trivial wrapper UseCase still earns its contract.</description>
    <code><![CDATA[
// src/domain/useCases/GetAllClientUseCase.ts
import { inject, injectable } from 'inversify';
import { TYPES } from '@/config/types';
import { UseCase } from '@/domain/useCases/UseCase';
import type { ClientRepository } from '@/domain/repositories/ClientRepository';
import { Client } from '@/domain/entities/Client';

@injectable()
export class GetAllClientUseCase implements UseCase<void, Client[]> {
  constructor(
    @inject(TYPES.ClientRepository)
    private readonly repo: ClientRepository,
  ) {}

  run(): Promise<Client[]> {
    return this.repo.getAll();
  }
}
    ]]></code>
  </example>

  <example name="screen-binding">
    <description>Screen resolves its ViewModel from the container, memoized.</description>
    <code><![CDATA[
// src/ui/screens/Clients/ClientsScreen.tsx
import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/config/di';
import { TYPES } from '@/config/types';
import { ClientsViewModel } from './ClientsViewModel';

export const ClientsScreen = observer(() => {
  const vm = useMemo(
    () => container.get<ClientsViewModel>(TYPES.ClientsViewModel),
    [],
  );
  useEffect(() => { vm.loadAll(); }, [vm]);
  // render vm.isItemsResponse / vm.isItemsLoading / vm.isItemsError ...
});
    ]]></code>
  </example>

  <output_format>
    Emit one fenced block per file, path comment first, in the creation order
    above. Finish with the explicit `types.ts` and `di.ts` additions and their
    binding scopes.
  </output_format>

  <related>
    <skill>skills/clean-architecture-mvvm.md</skill>
    <skill>skills/viewmodel-pattern.md</skill>
    <skill>skills/pr-checklist.md</skill>
  </related>

</skill>
