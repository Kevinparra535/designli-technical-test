import { useEffect, useMemo } from 'react';
import { Text,View } from 'react-native';
import { observer } from 'mobx-react-lite';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import { HomeViewModel } from './HomeViewModel';

export const HomeScreen = observer(() => {
  const vm = useMemo(
    () => container.get<HomeViewModel>(TYPES.HomeViewModel),
    [],
  );

  useEffect(() => {
    vm.initialize();
  }, [vm]);

  if (vm.isInitLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (vm.isInitError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error: {vm.isInitError}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Home!</Text>
    </View>
  );
});
