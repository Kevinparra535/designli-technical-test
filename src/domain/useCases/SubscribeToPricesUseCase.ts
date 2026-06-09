// src/domain/useCases/SubscribeToPricesUseCase.ts
//
// One business action: subscribe to real-time prices for a set of symbols.
// Resolves to a teardown function the caller invokes to stop the subscription.
// Depends only on the RealtimePriceRepository contract.

import { inject, injectable } from 'inversify';

import { TYPES } from '@/config/types';

import { Trade } from '@/domain/entities/Trade';

import type { RealtimePriceRepository } from '@/domain/repositories/RealtimePriceRepository';

import { UseCase } from '@/domain/useCases/UseCase';

export type SubscribeToPricesInput = {
  symbols: string[];
  onTrade: (trade: Trade) => void;
};

@injectable()
export class SubscribeToPricesUseCase implements UseCase<
  SubscribeToPricesInput,
  () => void
> {
  constructor(
    @inject(TYPES.RealtimePriceRepository)
    private readonly realtimePriceRepository: RealtimePriceRepository,
  ) {}

  async run(input: SubscribeToPricesInput): Promise<() => void> {
    return this.realtimePriceRepository.subscribe(input.symbols, input.onTrade);
  }
}
