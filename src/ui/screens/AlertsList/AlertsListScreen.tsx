import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TYPES } from '@/config/types';

import { StockAlert } from '@/domain/entities/StockAlert';

import type {
  AppTabParamList,
  RootStackParamList,
} from '@/ui/navigation/RootNavigator';

import { colors, fonts, radii, spacing } from '@/ui/styles/tokens';
import { fmtDate, fmtUsd } from '@/ui/utils/format';

import {
  Appear,
  Button,
  Icon,
  Mono,
  PressableScale,
  Spinner,
  Toast,
  Txt,
} from '@/ui/components';
import { useViewModel } from '@/ui/hooks/useViewModel';

import { AlertsListViewModel } from './AlertsListViewModel';

type AlertsNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Alerts'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const AlertsListScreen = observer(() => {
  const viewModel = useViewModel<AlertsListViewModel>(
    TYPES.AlertsListViewModel,
  );
  const navigation = useNavigation<AlertsNavigation>();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      viewModel.load();
    }, [viewModel]),
  );

  if (viewModel.isLoading && viewModel.alerts.length === 0) {
    return (
      <View style={styles.center}>
        <Spinner size={28} color={colors.up} />
      </View>
    );
  }

  const active = viewModel.alerts.filter((a) => a.active);
  const paused = viewModel.alerts.filter((a) => !a.active);
  const toastTone = viewModel.testMessage?.startsWith('Test sent')
    ? 'up'
    : 'warn';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={viewModel.isRefreshing}
            onRefresh={() => viewModel.refresh()}
            tintColor={colors.ink2}
          />
        }
      >
        {/* header */}
        <Appear>
          <Txt variant="title">Alertas</Txt>
          <Txt variant="caption" color="ink3" style={styles.subtitle}>
            {viewModel.alerts.length}{' '}
            {viewModel.alerts.length === 1 ? 'regla' : 'reglas'}
          </Txt>
        </Appear>

        {viewModel.error ? (
          <Txt variant="caption" color="down" style={styles.error}>
            {viewModel.error}
          </Txt>
        ) : null}

        {viewModel.isEmpty ? (
          <Appear index={1} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon name="bell" size={32} color={colors.ink3} />
            </View>
            <Txt variant="headline" align="center">
              Sin alertas todavía
            </Txt>
            <Txt
              variant="body"
              color="ink2"
              align="center"
              style={styles.emptyCopy}
            >
              Crea tu primera alerta desde cualquier acción y te avisamos cuando
              cruce tu precio.
            </Txt>
            <View style={styles.emptyBtn}>
              <Button
                label="Explorar mercado"
                variant="secondary"
                size="md"
                onPress={() => navigation.navigate('Home')}
                leading={<Icon name="plus" size={18} color={colors.ink} />}
              />
            </View>
          </Appear>
        ) : (
          <View style={styles.sections}>
            {active.length > 0 ? (
              <Section
                label="Activas"
                alerts={active}
                viewModel={viewModel}
                startIndex={1}
              />
            ) : null}
            {paused.length > 0 ? (
              <Section
                label="Pausadas"
                alerts={paused}
                viewModel={viewModel}
                startIndex={active.length + 2}
              />
            ) : null}
          </View>
        )}
      </ScrollView>

      {viewModel.testMessage ? (
        <Toast
          message={viewModel.testMessage}
          tone={toastTone}
          icon={
            <Icon
              name="check"
              size={17}
              color={toastTone === 'up' ? colors.up : colors.warn}
            />
          }
          onHide={() => viewModel.clearTestMessage()}
        />
      ) : null}
    </View>
  );
});

const Section = ({
  label,
  alerts,
  viewModel,
  startIndex,
}: {
  label: string;
  alerts: StockAlert[];
  viewModel: AlertsListViewModel;
  startIndex: number;
}) => (
  <View style={styles.section}>
    <Txt variant="label" style={styles.sectionLabel}>
      {label}
    </Txt>
    {alerts.map((a, i) => (
      <Appear key={a.id} index={startIndex + i}>
        <AlertRowItem
          alert={a}
          testing={viewModel.testingId === a.id}
          deleting={viewModel.deletingId === a.id}
          onTest={() => viewModel.test(a.id)}
          onDelete={() => viewModel.delete(a.id)}
        />
      </Appear>
    ))}
  </View>
);

const AlertRowItem = ({
  alert,
  testing,
  deleting,
  onTest,
  onDelete,
}: {
  alert: StockAlert;
  testing: boolean;
  deleting: boolean;
  onTest: () => void;
  onDelete: () => void;
}) => {
  const isAbove = alert.condition === 'above';
  const busy = testing || deleting;
  const when = fmtDate(alert.createdAt ?? null);

  return (
    <View style={[styles.row, !alert.active && styles.rowPaused]}>
      <Mono symbol={alert.symbol} size={42} />

      <View style={styles.rowMain}>
        <View style={styles.rowTop}>
          <Txt variant="bodyStrong">{alert.symbol}</Txt>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: alert.active ? colors.upDim : colors.bg4,
              },
            ]}
          >
            <Txt
              variant="label"
              style={{ color: alert.active ? colors.up : colors.ink3 }}
            >
              {alert.active ? 'Activa' : 'Pausada'}
            </Txt>
          </View>
        </View>

        <View style={styles.condRow}>
          <Icon
            name={isAbove ? 'arrowUp' : 'arrowDown'}
            size={12}
            color={colors.ink3}
          />
          <Txt variant="caption" color="ink2">
            {isAbove ? 'Sube de' : 'Baja de'}
          </Txt>
          <Txt variant="price" color="ink2" style={styles.condPrice}>
            {fmtUsd(alert.targetPrice, 0)}
          </Txt>
          {when ? (
            <>
              <Txt variant="caption" color="ink4">
                ·
              </Txt>
              <Txt variant="caption" color="ink3">
                {when}
              </Txt>
            </>
          ) : null}
        </View>
      </View>

      <PressableScale
        onPress={onTest}
        disabled={busy}
        style={[styles.iconBtn, busy && styles.iconBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel={`Probar alerta de ${alert.symbol}`}
      >
        {testing ? (
          <Spinner size={15} color={colors.ink2} />
        ) : (
          <Icon name="bell" size={15} color={colors.ink2} />
        )}
      </PressableScale>

      <PressableScale
        onPress={onDelete}
        disabled={busy}
        style={[styles.iconBtn, busy && styles.iconBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel={`Eliminar alerta de ${alert.symbol}`}
      >
        {deleting ? (
          <Spinner size={15} color={colors.down} />
        ) : (
          <Icon name="trash" size={15} color={colors.down} />
        )}
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  subtitle: { marginTop: 2 },
  error: { marginTop: spacing.md },
  sections: { marginTop: spacing.lg, gap: 22 },
  section: { gap: 10 },
  sectionLabel: { marginLeft: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: radii.md,
  },
  rowPaused: { opacity: 0.62 },
  rowMain: { flex: 1, minWidth: 0, gap: 3 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: radii.pill,
  },
  condRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  condPrice: { fontSize: 12.5 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: { opacity: 0.5 },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 12,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: radii.pill,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.hair,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyCopy: { marginTop: 2 },
  emptyBtn: { marginTop: spacing.lg },
});
