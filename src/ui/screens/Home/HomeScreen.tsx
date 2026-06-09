import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import type { RootStackParamList } from '@/ui/navigation/RootNavigator';

import { HomeViewModel } from './HomeViewModel';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = observer(() => {
  const vm = useMemo(
    () => container.get<HomeViewModel>(TYPES.HomeViewModel),
    [],
  );
  const navigation = useNavigation<HomeNavigation>();

  useEffect(() => {
    vm.initialize();
    return () => vm.dispose();
  }, [vm]);

  if (vm.isInitLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (vm.isInitError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {vm.isInitError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Home!</Text>

      <View style={styles.liveCard}>
        <Text style={styles.liveHeading}>Live prices</Text>
        {vm.livePriceList.map(({ symbol, price }) => (
          <View key={symbol} style={styles.liveRow}>
            <Text style={styles.liveSymbol}>{symbol}</Text>
            <Text style={styles.livePrice}>
              {price > 0 ? `$${price.toLocaleString()}` : '—'}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => navigation.navigate('CreateStockAlert')}
        accessibilityRole="button"
        style={styles.button}
      >
        <Text style={styles.buttonText}>Create price alert</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    padding: 24,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 24,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  error: { color: 'red' },
  liveCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    backgroundColor: '#F8FAFC',
  },
  liveHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveRow: { flexDirection: 'row', justifyContent: 'space-between' },
  liveSymbol: { fontSize: 15, color: '#0F172A', fontWeight: '600' },
  livePrice: {
    fontSize: 15,
    color: '#16A34A',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
