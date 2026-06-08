import { useEffect, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { observer } from 'mobx-react-lite';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import { CreateStockAlertViewModel } from './CreateStockAlertViewModel';

const CONDITIONS = [
  { value: 'above', label: 'Above ▲' },
  { value: 'below', label: 'Below ▼' },
] as const;

export const CreateStockAlertScreen = observer(() => {
  const vm = useMemo(
    () =>
      container.get<CreateStockAlertViewModel>(TYPES.CreateStockAlertViewModel),
    [],
  );

  // Clear the form state when the screen unmounts.
  useEffect(() => () => vm.reset(), [vm]);

  const onSubmit = async () => {
    const ok = await vm.submit();
    if (ok) vm.reset();
  };

  const disabled = !vm.isValid || vm.isSubmitting;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>New stock price alert</Text>
      <Text style={styles.subtitle}>
        Get notified when a stock crosses your target price.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Symbol</Text>
        <TextInput
          style={styles.input}
          placeholder="AAPL"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          autoCorrect={false}
          value={vm.symbol}
          onChangeText={(text) => vm.setSymbol(text)}
          accessibilityLabel="Stock symbol"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Target price (USD)</Text>
        <TextInput
          style={styles.input}
          placeholder="150.00"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          value={vm.targetPrice}
          onChangeText={(text) => vm.setTargetPrice(text)}
          accessibilityLabel="Target price in US dollars"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Trigger when price is</Text>
        <View style={styles.segment}>
          {CONDITIONS.map(({ value, label }) => {
            const selected = vm.condition === value;
            return (
              <Pressable
                key={value}
                onPress={() => vm.setCondition(value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.segmentItem,
                  selected && styles.segmentItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selected && styles.segmentTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {vm.submitError ? (
        <Text style={styles.error}>{vm.submitError}</Text>
      ) : null}
      {vm.hasSubmitSuccess ? (
        <Text style={styles.success}>Alert created ✔</Text>
      ) : null}

      <Pressable
        onPress={onSubmit}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={[styles.submit, disabled && styles.submitDisabled]}
      >
        <Text style={styles.submitText}>
          {vm.isSubmitting ? 'Saving…' : 'Create alert'}
        </Text>
      </Pressable>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: { padding: 24, gap: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: -12 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  segment: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentItemActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  segmentText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  segmentTextActive: { color: '#2563EB' },
  error: { color: '#DC2626', fontSize: 14 },
  success: { color: '#16A34A', fontSize: 14, fontWeight: '600' },
  submit: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
