# Skill — Canonical ViewModel Pattern (MobX)

<skill name="viewmodel-pattern">

  <role>
    You write MobX ViewModels that are the single source of UI state for a
    feature, orchestrating UseCases and exposing observable flags — and nothing
    platform-specific.
  </role>

  <context>
    A ViewModel lives at `src/ui/screens/<Feature>/<Feature>ViewModel.ts`, is
    `@injectable`, and is resolved per-screen (transient). State is grouped by
    operation kind: a read group (`isItemsLoading/Error/Response`) and a write
    group (`isSubmitting`, `isSubmitError`, `hasSubmitSuccess`).
  </context>

  <rules>
    <rule id="1">`@injectable()` on the class; `makeAutoObservable(this)` in the constructor.</rule>
    <rule id="2">Declare an `ICalls` union enumerating every async operation.</rule>
    <rule id="3">`updateLoadingState()` is the ONLY place loading/error flags mutate.</rule>
    <rule id="4">`handleError()` is the ONLY place exceptions are handled.</rule>
    <rule id="5">Every post-`await` mutation is wrapped in `runInAction(...)`.</rule>
    <rule id="6">`reset()` clears UI state only (never persistent domain data).</rule>
    <rule id="7">No `Alert`, navigation, React hooks, or direct `console` — log via `@/ui/utils/Logger`.</rule>
  </rules>

  <instructions>
    1. Inject one UseCase per action through the constructor with `@inject(TYPES.X)`.
    2. Each public action: call `updateLoadingState(true, null, kind)`, `await`
       the UseCase, apply results inside `runInAction`, then
       `updateLoadingState(false, null, kind)`; on throw, `handleError(e, kind)`.
    3. Write actions return `Promise<boolean>` (success flag) for the screen to react to.
    4. Expose derived UI booleans as `get` computed values, not stored fields.
  </instructions>

  <example name="canonical-shape">
    <code><![CDATA[
import { inject, injectable } from 'inversify';
import { makeAutoObservable, runInAction } from 'mobx';
import { TYPES } from '@/config/types';
import { Client } from '@/domain/entities/Client';
import { GetAllClientUseCase } from '@/domain/useCases/GetAllClientUseCase';
import Logger from '@/ui/utils/Logger';

type ICalls = 'items' | 'create' | 'update' | 'delete';

@injectable()
export class ClientsViewModel {
  isItemsLoading = false;
  isItemsError: string | null = null;
  isItemsResponse: Client[] | null = null;

  private logger = new Logger('ClientsViewModel');

  constructor(
    @inject(TYPES.GetAllClientUseCase)
    private readonly getAllClientUseCase: GetAllClientUseCase,
  ) {
    makeAutoObservable(this);
  }

  get itemCount(): number {
    return this.isItemsResponse?.length ?? 0;
  }

  async loadAll(): Promise<void> {
    this.updateLoadingState(true, null, 'items');
    try {
      const response = await this.getAllClientUseCase.run();
      runInAction(() => { this.isItemsResponse = response; });
      this.updateLoadingState(false, null, 'items');
    } catch (error) {
      this.handleError(error, 'items');
    }
  }

  private updateLoadingState(isLoading: boolean, error: string | null, type: ICalls) {
    runInAction(() => {
      if (type === 'items') {
        this.isItemsLoading = isLoading;
        this.isItemsError = error;
      }
      // ...other groups
    });
  }

  private handleError(error: unknown, type: ICalls) {
    const message = `Error in ${type}: ${error instanceof Error ? error.message : String(error)}`;
    this.logger.error(message);
    this.updateLoadingState(false, message, type);
  }
}
    ]]></code>
  </example>

  <output_format>
    One fenced TypeScript block, path comment first. Note any new TYPES/di.ts
    bindings the VM requires (transient scope).
  </output_format>

  <related>
    <skill>skills/clean-architecture-mvvm.md</skill>
    <skill>skills/feature-scaffold.md</skill>
    <reference>ADR 005 — canonical ViewModel pattern</reference>
  </related>

</skill>
