import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useFocusEffect } from '@react-navigation/native';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import { StockAlert } from '@/domain/entities/StockAlert';

import { AlertsListViewModel } from './AlertsListViewModel';

export const AlertsListScreen = observer(() => {
  const vm = useMemo(
    () => container.get<AlertsListViewModel>(TYPES.AlertsListViewModel),
    [],
  );

  // Reload whenever the tab gains focus so freshly created alerts show up.
  useFocusEffect(
    useCallback(() => {
      vm.load();
    }, [vm]),
  );

  if (vm.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={vm.alerts}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={vm.isRefreshing}
          onRefresh={() => vm.refresh()}
        />
      }
      ListHeaderComponent={
        <>
          {vm.error ? <Text style={styles.error}>{vm.error}</Text> : null}
          {vm.testMessage ? (
            <Pressable onPress={() => vm.clearTestMessage()}>
              <Text style={styles.banner}>{vm.testMessage} ✕</Text>
            </Pressable>
          ) : null}
        </>
      }
      ListEmptyComponent={
        vm.isEmpty ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptySubtitle}>
              Create a price alert and it will appear here.
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <AlertRow
          alert={item}
          deleting={vm.deletingId === item.id}
          testing={vm.testingId === item.id}
          onDelete={() => vm.delete(item.id)}
          onTest={() => vm.test(item.id)}
        />
      )}
    />
  );
});

const AlertRow = observer(
  ({
    alert,
    deleting,
    testing,
    onDelete,
    onTest,
  }: {
    alert: StockAlert;
    deleting: boolean;
    testing: boolean;
    onDelete: () => void;
    onTest: () => void;
  }) => {
    const isAbove = alert.condition === 'above';
    const busy = deleting || testing;
    return (
      <View style={styles.row}>
        <View style={styles.rowMain}>
          <Text style={styles.symbol}>{alert.symbol}</Text>
          <Text style={styles.condition}>
            <Text style={isAbove ? styles.above : styles.below}>
              {isAbove ? 'Above ▲' : 'Below ▼'}
            </Text>
            {`  $${alert.targetPrice.toLocaleString()}`}
          </Text>
        </View>

        <View style={styles.rowActions}>
          <Pressable
            onPress={onTest}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Send a test notification for ${alert.symbol}`}
            style={[styles.testBtn, busy && styles.btnDisabled]}
            hitSlop={8}
          >
            {testing ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Text style={styles.testText}>Test 🔔</Text>
            )}
          </Pressable>

          <Pressable
            onPress={onDelete}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${alert.symbol} alert`}
            style={[styles.deleteBtn, busy && styles.btnDisabled]}
            hitSlop={8}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Text style={styles.deleteText}>Delete</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, gap: 12, flexGrow: 1 },
  error: { color: '#DC2626', fontSize: 14, marginBottom: 8 },
  banner: {
    color: '#1E40AF',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    overflow: 'hidden',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  rowMain: { gap: 4, flex: 1 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  symbol: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  condition: {
    fontSize: 14,
    color: '#334155',
    fontVariant: ['tabular-nums'],
  },
  above: { color: '#16A34A', fontWeight: '700' },
  below: { color: '#DC2626', fontWeight: '700' },
  testBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    minWidth: 72,
    alignItems: 'center',
  },
  testText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    minWidth: 72,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  deleteText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
});
