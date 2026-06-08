// src/domain/useCases/UseCase.ts
//
// Base contract every UseCase implements. One business action = one UseCase.
//
// A UseCase depends ONLY on domain contracts (repository/service interfaces),
// never on data-layer implementations. Use `void` as Input when the action
// takes no argument.

export interface UseCase<Input, Output> {
  run(data: Input): Promise<Output>;
}
