import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import type { RootStackParamList } from '@/ui/navigation/RootNavigator';

import { StockDetailViewModel } from './StockDetailViewModel';

type DetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'StockDetail'
>;
type DetailRoute = RouteProp<RootStackParamList, 'StockDetail'>;

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

export const StockDetailScreen = observer(() => {
  const vm = useMemo(
    () => container.get<StockDetailViewModel>(TYPES.StockDetailViewModel),
    [],
  );
  const navigation = useNavigation<DetailNavigation>();
  const { symbol } = useRoute<DetailRoute>().params;

  useEffect(() => {
    vm.load(symbol);
  }, [vm, symbol]);

  if (vm.isLoading && !vm.detail) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (vm.error && !vm.detail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {vm.error}</Text>
      </View>
    );
  }

  const detail = vm.detail;
  const quote = detail?.quote;
  const profile = detail?.profile;
  const changeColor = vm.isUp ? '#16A34A' : '#DC2626';
  const sign = vm.isUp ? '+' : '';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.symbol}>{symbol}</Text>
      {profile?.name ? <Text style={styles.name}>{profile.name}</Text> : null}

      {quote ? (
        <View style={styles.priceBlock}>
          <Text style={styles.price}>${quote.current.toLocaleString()}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {sign}
            {quote.change.toFixed(2)} ({sign}
            {quote.percentChange.toFixed(2)}%)
          </Text>
        </View>
      ) : null}

      {quote ? (
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Today</Text>
          <Row label="Open" value={`$${quote.open.toLocaleString()}`} />
          <Row label="High" value={`$${quote.high.toLocaleString()}`} />
          <Row label="Low" value={`$${quote.low.toLocaleString()}`} />
          <Row
            label="Prev. close"
            value={`$${quote.previousClose.toLocaleString()}`}
          />
        </View>
      ) : null}

      {profile && (profile.exchange || profile.marketCapitalization > 0) ? (
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Company</Text>
          {profile.exchange ? (
            <Row label="Exchange" value={profile.exchange} />
          ) : null}
          {profile.currency ? (
            <Row label="Currency" value={profile.currency} />
          ) : null}
          {profile.country ? (
            <Row label="Country" value={profile.country} />
          ) : null}
          {profile.marketCapitalization > 0 ? (
            <Row
              label="Market cap"
              value={`$${Math.round(profile.marketCapitalization).toLocaleString()} M`}
            />
          ) : null}
          {profile.weburl ? (
            <Pressable onPress={() => Linking.openURL(profile.weburl)}>
              <Text style={styles.link}>{profile.weburl}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Pressable
        onPress={() => navigation.navigate('CreateStockAlert', { symbol })}
        accessibilityRole="button"
        style={styles.button}
      >
        <Text style={styles.buttonText}>Create price alert</Text>
      </Pressable>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#DC2626' },
  container: { padding: 24, gap: 16 },
  symbol: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  name: { fontSize: 15, color: '#64748B', marginTop: -8 },
  priceBlock: { gap: 4 },
  price: { fontSize: 34, fontWeight: '700', color: '#0F172A' },
  change: { fontSize: 16, fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    backgroundColor: '#F8FAFC',
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: '#64748B' },
  rowValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  link: { fontSize: 14, color: '#2563EB' },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
