// src/ui/hooks/useViewModel.ts
//
// Resolves a ViewModel (or any bound type) from the Inversify container and
// memoizes it for the component's lifetime. Encapsulates the container access
// so screens don't touch the DI container directly.

import { useMemo } from 'react';

import { container } from '@/config/di';

export function useViewModel<T>(identifier: symbol): T {
  return useMemo(() => container.get<T>(identifier), [identifier]);
}
