import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TYPES } from '@/config/types';

import type { RootStackParamList } from '@/ui/navigation/RootNavigator';

import { colors, fonts, radii, spacing } from '@/ui/styles/tokens';
import { displaySymbol, fmtSigned, fmtUsd } from '@/ui/utils/format';

import {
  Appear,
  Button,
  Delta,
  Icon,
  Mono,
  PressableScale,
  PriceChart,
  Spinner,
  Txt,
} from '@/ui/components';
import { useViewModel } from '@/ui/hooks/useViewModel';

import { StockDetailViewModel } from './StockDetailViewModel';

type DetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'StockDetail'
>;

const RANGES = ['1H', '1D', '1S', '1M', '1A', 'Máx'] as const;

export const StockDetailScreen = observer(() => {
  const viewModel = useViewModel<StockDetailViewModel>(
    TYPES.StockDetailViewModel,
  );
  const navigation = useNavigation<DetailNavigation>();
  const route = useRoute<RouteProp<RootStackParamList, 'StockDetail'>>();
  const insets = useSafeAreaInsets();
  const symbol = route.params.symbol;
  const [range, setRange] = useState<(typeof RANGES)[number]>('1D');

  useEffect(() => {
    viewModel.load(symbol);
    return () => viewModel.dispose();
  }, [viewModel, symbol]);

  const display = displaySymbol(symbol);
  const goCreateAlert = () =>
    navigation.navigate('CreateStockAlert', { symbol });

  return (
    <View style={styles.screen}>
      {/* nav */}
      <View style={[styles.nav, { paddingTop: insets.top + 4 }]}>
        <PressableScale
          onPress={() => navigation.goBack()}
          style={styles.navBtn}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevL" size={20} color={colors.ink} />
        </PressableScale>
        <View style={styles.navTitle}>
          <Mono symbol={display} size={26} />
          <Txt variant="headline">{display}</Txt>
        </View>
        <View style={styles.navBtn}>
          <Icon name="search" size={18} color={colors.ink2} />
        </View>
      </View>

      {viewModel.isLoading ? (
        <View style={styles.center}>
          <Spinner size={28} color={colors.up} />
        </View>
      ) : viewModel.error ? (
        <View style={styles.center}>
          <Txt variant="body" color="down" align="center">
            {viewModel.error}
          </Txt>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* price */}
          <Appear>
            <View style={styles.priceBlock}>
              <Txt variant="caption" color="ink3">
                {viewModel.profile?.name || display}
                {viewModel.profile?.exchange
                  ? ` · ${viewModel.profile.exchange}`
                  : ''}
              </Txt>
              <Txt variant="displayMono" style={styles.bigPrice}>
                {viewModel.priceAvailable ? fmtUsd(viewModel.price) : '—'}
              </Txt>
              {viewModel.priceAvailable ? (
                <View style={styles.changeRow}>
                  <Delta pct={viewModel.percentChange} />
                  <Txt
                    style={{
                      fontFamily: fonts.mono.semibold,
                      fontSize: 13,
                      color: viewModel.isUp ? colors.up : colors.down,
                    }}
                  >
                    {`${fmtSigned(viewModel.changeValue)} ${
                      viewModel.hasQuote ? 'hoy' : 'en la sesión'
                    }`}
                  </Txt>
                </View>
              ) : (
                <Txt variant="caption" color="ink3" style={styles.noData}>
                  Esperando datos en vivo para este símbolo…
                </Txt>
              )}
            </View>
          </Appear>

          {/* chart (real intraday trajectory from the quote) */}
          {viewModel.series.length >= 2 ? (
            <Appear index={1} style={styles.chart}>
              <PriceChart
                data={viewModel.series}
                up={viewModel.isUp}
                target={viewModel.alert?.targetPrice ?? null}
                height={200}
              />
            </Appear>
          ) : null}

          {/* range selector */}
          {viewModel.hasQuote ? (
            <Appear index={2} style={styles.ranges}>
              {RANGES.map((r) => {
                const on = r === range;
                return (
                  <PressableScale
                    key={r}
                    onPress={() => setRange(r)}
                    scaleTo={0.94}
                    style={[styles.range, on && styles.rangeOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Txt
                      style={{
                        fontFamily: fonts.mono.bold,
                        fontSize: 12.5,
                        color: on ? colors.ink : colors.ink3,
                      }}
                    >
                      {r}
                    </Txt>
                  </PressableScale>
                );
              })}
            </Appear>
          ) : null}

          {/* stats */}
          {viewModel.hasQuote && viewModel.quote ? (
            <Appear index={3} style={styles.statsWrap}>
              <View style={styles.stats}>
                <StatCell
                  label="Apertura"
                  value={fmtUsd(viewModel.quote.open)}
                />
                <StatCell
                  label="Máx día"
                  value={fmtUsd(viewModel.quote.high)}
                />
                <StatCell label="Mín día" value={fmtUsd(viewModel.quote.low)} />
                <StatCell
                  label="Cierre ant."
                  value={fmtUsd(viewModel.quote.previousClose)}
                />
              </View>
            </Appear>
          ) : null}

          {/* alert CTA */}
          <Appear index={4} style={styles.cta}>
            {viewModel.alert ? (
              <View style={styles.alertCard}>
                <View style={styles.alertIcon}>
                  <Icon name="bell" size={19} color={colors.warn} />
                </View>
                <View style={styles.alertText}>
                  <Txt variant="bodyStrong">Alerta activa</Txt>
                  <Txt variant="caption" color="ink2">
                    {`Te avisamos ${
                      viewModel.alert.condition === 'above'
                        ? 'al subir de'
                        : 'al bajar de'
                    } ${fmtUsd(viewModel.alert.targetPrice, 0)}`}
                  </Txt>
                </View>
                <PressableScale
                  onPress={goCreateAlert}
                  scaleTo={0.95}
                  accessibilityRole="button"
                >
                  <Txt
                    variant="caption"
                    color="warn"
                    style={{ fontFamily: fonts.sans.bold }}
                  >
                    Editar
                  </Txt>
                </PressableScale>
              </View>
            ) : (
              <Button
                label="Crear alerta de precio"
                onPress={goCreateAlert}
                leading={
                  <Icon name="bellPlus" size={20} color={colors.upInk} />
                }
                full
              />
            )}
          </Appear>
        </ScrollView>
      )}
    </View>
  );
});

const StatCell = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statCell}>
    <Txt variant="caption" color="ink3">
      {label}
    </Txt>
    <Txt variant="price" style={styles.statValue}>
      {value}
    </Txt>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  content: { paddingBottom: 32 },
  priceBlock: { paddingHorizontal: 20, paddingTop: spacing.sm },
  bigPrice: { fontSize: 40, letterSpacing: -1.4, marginTop: 4 },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  noData: { marginTop: spacing.sm },
  chart: { paddingHorizontal: 12, paddingTop: spacing.md },
  ranges: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    marginTop: spacing.md,
  },
  range: {
    flex: 1,
    height: 34,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeOn: { backgroundColor: colors.bg4 },
  statsWrap: { paddingHorizontal: 20, marginTop: spacing.md },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hair,
    overflow: 'hidden',
  },
  statCell: {
    width: '50%',
    padding: 13,
    backgroundColor: colors.bg,
    borderColor: colors.hair,
    borderWidth: 0.5,
  },
  statValue: { marginTop: 3 },
  cta: { paddingHorizontal: 20, marginTop: spacing.lg },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 16,
    borderRadius: radii.md,
    backgroundColor: colors.warnDim,
  },
  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.warnDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: { flex: 1, gap: 1 },
});
