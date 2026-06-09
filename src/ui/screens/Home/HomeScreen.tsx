import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import type {
  AppTabParamList,
  RootStackParamList,
} from '@/ui/navigation/RootNavigator';

import {
  Appear,
  Delta,
  Icon,
  Mono,
  PressableScale,
  Sparkline,
  Spinner,
  Txt,
} from '@/ui/components';
import { SessionViewModel } from '@/ui/screens/Login/SessionViewModel';
import { colors, fonts, radii, spacing } from '@/ui/theme/tokens';

import { HomeViewModel, type MarketRow } from './HomeViewModel';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Tab = 'watch' | 'movers';

const fmtUsd = (n: number) =>
  '$' +
  n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const greeting = (email?: string) => {
  const name = email ? email.split('@')[0] : '';
  return name ? `Hola, ${name}` : 'Hola';
};

export const HomeScreen = observer(() => {
  const vm = useMemo(
    () => container.get<HomeViewModel>(TYPES.HomeViewModel),
    [],
  );
  const session = useMemo(
    () => container.get<SessionViewModel>(TYPES.SessionViewModel),
    [],
  );
  const navigation = useNavigation<HomeNavigation>();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('watch');

  useEffect(() => {
    vm.initialize();
    return () => vm.dispose();
  }, [vm]);

  if (vm.isInitLoading) {
    return (
      <View style={styles.center}>
        <Spinner size={28} color={colors.up} />
      </View>
    );
  }

  const rows = tab === 'watch' ? vm.rows : vm.movers;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <Appear>
          <View style={styles.header}>
            <View>
              <Txt variant="caption" color="ink3">
                {greeting(session.currentUser?.email)}
              </Txt>
              <Txt variant="title" style={styles.h1}>
                Mercado
              </Txt>
            </View>
            <PressableScale
              onPress={() => navigation.navigate('Alerts')}
              style={styles.bell}
              accessibilityRole="button"
              accessibilityLabel="Ver alertas"
            >
              <Icon name="bell" size={21} color={colors.ink} />
              <View style={styles.bellDot} />
            </PressableScale>
          </View>
        </Appear>

        {/* hero card */}
        <Appear index={1}>
          <View style={styles.card}>
            <Txt variant="caption" color="ink3">
              Valor de seguimiento
            </Txt>
            <View style={styles.cardRow}>
              <View>
                <Txt variant="displayMono">
                  {vm.totalValue > 0 ? fmtUsd(vm.totalValue) : '—'}
                </Txt>
                <View style={styles.cardDelta}>
                  <Delta pct={vm.totalPct} size="sm" />
                  <Txt variant="caption" color="ink3">
                    hoy
                  </Txt>
                </View>
              </View>
              <Sparkline
                data={vm.aggregateHistory}
                up={vm.totalPct >= 0}
                width={96}
                height={48}
                strokeWidth={2.2}
              />
            </View>
          </View>
        </Appear>

        {/* tabs */}
        <Appear index={2} style={styles.tabs}>
          {(
            [
              ['watch', 'Seguimiento'],
              ['movers', 'Más activos'],
            ] as const
          ).map(([id, label]) => {
            const on = tab === id;
            return (
              <PressableScale
                key={id}
                onPress={() => setTab(id)}
                scaleTo={0.96}
                style={[styles.tab, on && styles.tabActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Txt
                  style={{
                    fontFamily: fonts.sans.bold,
                    fontSize: 15,
                    color: on ? colors.ink : colors.ink3,
                  }}
                >
                  {label}
                </Txt>
              </PressableScale>
            );
          })}
        </Appear>

        {/* list */}
        <View style={styles.list}>
          {rows.map((r, i) => (
            <Appear key={r.symbol} index={3 + i}>
              <MarketRowItem
                row={r}
                onPress={() =>
                  navigation.navigate('StockDetail', { symbol: r.symbol })
                }
              />
            </Appear>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

const MarketRowItem = ({
  row,
  onPress,
}: {
  row: MarketRow;
  onPress: () => void;
}) => (
  <PressableScale
    onPress={onPress}
    scaleTo={0.985}
    style={styles.row}
    accessibilityRole="button"
    accessibilityLabel={`Ver ${row.displaySymbol}`}
  >
    <Mono symbol={row.displaySymbol} />
    <View style={styles.rowMain}>
      <Txt variant="bodyStrong">{row.displaySymbol}</Txt>
      <Txt variant="caption" color="ink3" numberOfLines={1}>
        {row.name}
      </Txt>
    </View>
    <Sparkline data={row.history} up={row.pct >= 0} width={64} height={28} />
    <View style={styles.rowRight}>
      <Txt variant="price">{row.price > 0 ? fmtUsd(row.price) : '—'}</Txt>
      <View style={styles.deltaWrap}>
        <Delta pct={row.pct} size="sm" />
      </View>
    </View>
  </PressableScale>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: spacing.sm,
  },
  h1: { marginTop: 2 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.up,
    borderWidth: 2,
    borderColor: colors.bg2,
  },
  card: {
    marginHorizontal: 20,
    marginTop: spacing.sm,
    padding: 18,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: radii.lg,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardDelta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 6,
  },
  tabs: {
    flexDirection: 'row',
    gap: 18,
    paddingHorizontal: 20,
    marginTop: spacing.lg,
    marginBottom: 2,
  },
  tab: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: { borderColor: colors.up },
  list: { paddingHorizontal: 4, paddingTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.md,
  },
  rowMain: { flex: 1, minWidth: 0 },
  rowRight: { alignItems: 'flex-end', minWidth: 86, gap: 3 },
  deltaWrap: { alignSelf: 'flex-end' },
});
