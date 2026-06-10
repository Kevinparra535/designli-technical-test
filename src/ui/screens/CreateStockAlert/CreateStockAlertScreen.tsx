import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';

import { TYPES } from '@/config/types';

import type { AlertCondition } from '@/domain/entities/StockAlert';

import type { RootStackParamList } from '@/ui/navigation/RootNavigator';

import { colors, screenPad, spacing } from '@/ui/styles/tokens';

import type { SegmentOption } from '@/ui/components';
import { Appear, Button, Field, Segmented, Txt } from '@/ui/components';
import { useViewModel } from '@/ui/hooks/useViewModel';
import { stockAlertSchema } from '@/ui/schemas';

import { CreateStockAlertViewModel } from './CreateStockAlertViewModel';

// Client-side validation lives here (UI concern); the ViewModel owns the
// business action. targetPrice stays a string for the TextInput and is parsed
// on submit.

type FormValues = z.infer<typeof stockAlertSchema>;

const CONDITION_OPTIONS: SegmentOption<AlertCondition>[] = [
  { value: 'above', label: 'Above ▲', tone: 'up' },
  { value: 'below', label: 'Below ▼', tone: 'down' },
];

export const CreateStockAlertScreen = observer(() => {
  const viewModel = useViewModel<CreateStockAlertViewModel>(
    TYPES.CreateStockAlertViewModel,
  );

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CreateStockAlert'>
    >();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateStockAlert'>>();
  const presetSymbol = route.params?.symbol;

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(stockAlertSchema),
    mode: 'onChange',
    defaultValues: {
      symbol: presetSymbol?.toUpperCase() ?? '',
      targetPrice: '',
      condition: 'above',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const symbol = values.symbol.trim().toUpperCase();
    const ok = await viewModel.submit({
      symbol,
      targetPrice: Number(values.targetPrice.replace(',', '.')),
      condition: values.condition,
    });

    if (ok) {
      navigation.goBack();
      Alert.alert(
        'Alert created',
        `We'll notify you when ${symbol} hits your target.`,
      );
    } else {
      Alert.alert(
        "Couldn't create the alert",
        viewModel.submitError ?? 'Please try again.',
      );
    }
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Appear>
        <Txt variant="title">New stock price alert</Txt>
        <Txt variant="body" color="ink2" style={styles.subtitle}>
          Get notified when a stock crosses your target price.
        </Txt>
      </Appear>

      <Appear index={1} style={styles.field}>
        <Controller
          control={control}
          name="symbol"
          render={({ field, fieldState }) => (
            <Field
              label="Symbol"
              placeholder="AAPL"
              autoCapitalize="characters"
              value={field.value}
              onChangeText={(t) =>
                field.onChange(t.toUpperCase().replace(/\s/g, ''))
              }
              error={fieldState.error?.message}
              accessibilityLabel="Stock symbol"
            />
          )}
        />
      </Appear>

      <Appear index={2} style={styles.field}>
        <Controller
          control={control}
          name="targetPrice"
          render={({ field, fieldState }) => (
            <Field
              label="Target price"
              prefix="$"
              placeholder="150.00"
              keyboardType="decimal-pad"
              value={field.value}
              onChangeText={(t) => field.onChange(t.replace(/[^0-9.,]/g, ''))}
              error={fieldState.error?.message}
              accessibilityLabel="Target price in US dollars"
            />
          )}
        />
      </Appear>

      <Appear index={3} style={styles.field}>
        <Txt variant="caption" color="ink2">
          Trigger when price is
        </Txt>
        <Controller
          control={control}
          name="condition"
          render={({ field }) => (
            <Segmented
              options={CONDITION_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Appear>

      <Appear index={4}>
        <View style={styles.submit}>
          <Button
            label="Create alert"
            onPress={onSubmit}
            loading={viewModel.isSubmitting}
            disabled={!isValid}
            full
          />
        </View>
      </Appear>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.bg },
  content: { padding: screenPad, gap: spacing.xl },
  subtitle: { marginTop: spacing.xs },
  field: { gap: spacing.sm },
  submit: { marginTop: spacing.xs },
});
