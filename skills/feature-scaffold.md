# Skill — Feature Scaffold (vertical slice)

<skill name="feature-scaffold">

  <role>
    You scaffold a complete vertical slice for one feature across every layer,
    wired through Inversify, following the Clean Architecture + MVVM rules in
    `skills/clean-architecture-mvvm.md`.
  </role>

  <context>
    Given a feature named `<Feature>` operating on entity `<Entity>` (e.g.
    Feature=Stocks, Entity=Stock), the slice flows one way:

      ui → viewModel → useCase → repository(contract) ← repositoryImpl
                                     repositoryImpl → service(contract) ← serviceImpl
                                                          serviceImpl → manager (infra)

    The data layer has THREE links: a Manager does raw provider/SDK calls, a
    Service maps the raw DTOs into domain entities, and a Repository delegates to
    the service. Path alias: `@/*` → `src/*`.
  </context>

  <instructions>
    Create the files in this order (each depends only on the ones above it):

    1. Domain entity → `src/domain/entities/<Entity>.ts`
       A local `export interface ConstructorParams` (named EXACTLY that) with the
       fields, an optional `error?: string | null`, and `[key: string]: any`.
       The class declares each field with an indexed-access type
       (`public id: ConstructorParams['id'];`), also carries `[key: string]: any`,
       and the constructor `(model: ConstructorParams)` assigns each field
       explicitly. Pure data class — NO `Object.assign`, NO methods.

    2. Domain contracts → `src/domain/repositories/<Entity>Repository.ts`
                          `src/domain/services/<Entity>Service.ts`
       interfaces only, expressed in terms of the domain entity (never DTOs).

    3. UseCases → `src/domain/useCases/<Action><Entity>UseCase.ts`
       one class per action, `@injectable`, implements `UseCase<Input, Output>`
       from `@/domain/useCases/UseCase`, depends on the REPOSITORY interface via
       `@inject(TYPES.<Entity>Repository)`.

    4. Data model (DTO) → `src/data/models/<Entity>Model.ts`
       mirrors the backend payload; `fromJson()` / `fromJsonList()` and a
       `toDomain()` that maps to the entity.

    5. Data layer — three links (dependency flows downward):
       a. Manager → `src/data/network/<Provider>Manager.ts`
          raw provider/SDK calls; returns DTOs. Often already exists / is shared.
       b. ServiceImpl → `src/data/services/<Entity>ServiceImpl.ts`
          `@injectable`, injects the Manager (`private service`), implements
          `<Entity>Service`. The SINGLE place DTO→domain mapping happens:
          `<Entity>Model.fromJsonList(res).map((m) => m.toDomain())`.
       c. RepositoryImpl → `src/data/repositories/<Entity>RepositoryImpl.ts`
          `@injectable`, injects the Service (`private service`), implements
          `<Entity>Repository`, and DELEGATES — passthrough returning domain
          entities. NO mapping here.

    6. UI → `src/ui/screens/<Feature>/<Feature>ViewModel.ts`
            `src/ui/screens/<Feature>/<Feature>Screen.tsx`
       ViewModel per `skills/viewmodel-pattern.md`; screen is an `observer()` that
       resolves the VM from the container.

    7. DI registration → edit `src/config/types.ts` and `src/config/di.ts`:
       a `Symbol.for(...)` per injectable; bind Manager + Service + RepositoryImpl
       as singletons, UseCases + ViewModel as transient.
  </instructions>

  <example name="entity">
    <description>Pure data entity — interface ConstructorParams + indexed-access fields + explicit constructor.</description>
    <code><![CDATA[
// src/domain/entities/Stock.ts
export interface ConstructorParams {
  symbol: string;
  description: string;
  type: string;
  error?: string | null;
  [key: string]: any;
}

export class Stock {
  public symbol: ConstructorParams['symbol'];
  public description: ConstructorParams['description'];
  public type: ConstructorParams['type'];
  public error?: ConstructorParams['error'];
  [key: string]: any;

  constructor(model: ConstructorParams) {
    this.symbol = model.symbol;
    this.description = model.description;
    this.type = model.type;
    this.error = model.error;
  }
}
    ]]></code>
  </example>

  <example name="data-chain">
    <description>ServiceImpl maps DTO→domain; RepositoryImpl delegates. Both name the injected dep `service`.</description>
    <code><![CDATA[
// src/data/services/StockServiceImpl.ts
@injectable()
export class StockServiceImpl implements StockService {
  constructor(
    @inject(TYPES.FinnhubManager) private readonly service: FinnhubManager,
  ) {}

  async getStockList(exchange = 'US'): Promise<Stock[]> {
    const items = await this.service.getStockSymbols(exchange);
    return StockModel.fromJsonList(items).map((m) => m.toDomain());
  }
}

// src/data/repositories/StockRepositoryImpl.ts
@injectable()
export class StockRepositoryImpl implements StockRepository {
  constructor(
    @inject(TYPES.StockService) private readonly service: StockService,
  ) {}

  getStockList(exchange?: string): Promise<Stock[]> {
    return this.service.getStockList(exchange); // passthrough, no mapping
  }
}
    ]]></code>
  </example>

  <example name="usecase">
    <description>One action = one UseCase; depends on the repository contract.</description>
    <code><![CDATA[
// src/domain/useCases/GetStockListUseCase.ts
import { inject, injectable } from 'inversify';
import { TYPES } from '@/config/types';
import { UseCase } from '@/domain/useCases/UseCase';
import type { StockRepository } from '@/domain/repositories/StockRepository';
import { Stock } from '@/domain/entities/Stock';

@injectable()
export class GetStockListUseCase implements UseCase<void, Stock[]> {
  constructor(
    @inject(TYPES.StockRepository)
    private readonly stockRepository: StockRepository,
  ) {}

  run(): Promise<Stock[]> {
    return this.stockRepository.getStockList();
  }
}
    ]]></code>
  </example>

  <example name="screen-binding">
    <description>Screen resolves its ViewModel from the container, memoized.</description>
    <code><![CDATA[
// src/ui/screens/Stocks/StocksScreen.tsx
import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/config/di';
import { TYPES } from '@/config/types';
import { StocksViewModel } from './StocksViewModel';

export const StocksScreen = observer(() => {
  const vm = useMemo(
    () => container.get<StocksViewModel>(TYPES.StocksViewModel),
    [],
  );
  useEffect(() => {
    vm.loadAll();
  }, [vm]);
  // render vm.isItemsResponse / vm.isItemsLoading / vm.isItemsError ...
});
    ]]></code>
  </example>

  <output_format>
    Emit one fenced block per file, path comment first, in the creation order
    above. Finish with the explicit `types.ts` and `di.ts` additions and their
    binding scopes (Manager + Service + RepositoryImpl singletons; UseCase + VM
    transient).
  </output_format>

  <related>
    <skill>skills/clean-architecture-mvvm.md</skill>
    <skill>skills/viewmodel-pattern.md</skill>
    <skill>skills/pr-checklist.md</skill>
  </related>

</skill>
