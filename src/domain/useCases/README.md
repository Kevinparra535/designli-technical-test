# `domain/useCases`

One business action = one UseCase class. Each implements
[`UseCase<Input, Output>`](./UseCase.ts) with a single public `run()` method and
depends only on domain contracts (interfaces), injected via Inversify.

Naming: `{Action}{Entity}UseCase` — e.g. `GetAllClientUseCase`,
`CreateClientUseCase`, `TransferFundsUseCase`.

Trivial CRUD wrappers still earn their place: they give every action a
discoverable, mockable contract. The pattern pays off most when a UseCase grows
real rules (validation, multi-step orchestration across repositories).
