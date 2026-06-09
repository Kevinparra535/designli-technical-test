import { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { observer } from 'mobx-react-lite';

import { container } from '@/config/di';
import { TYPES } from '@/config/types';

import { SessionViewModel } from './SessionViewModel';

export const LoginScreen = observer(() => {
  const vm = useMemo(
    () => container.get<SessionViewModel>(TYPES.SessionViewModel),
    [],
  );

  const disabled = !vm.isFormValid || vm.isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>Stocks alerts — welcome back.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={vm.email}
            onChangeText={(text) => vm.setEmail(text)}
            accessibilityLabel="Email"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={vm.password}
            onChangeText={(text) => vm.setPassword(text)}
            accessibilityLabel="Password"
          />
        </View>

        {vm.submitError ? (
          <Text style={styles.error}>{vm.submitError}</Text>
        ) : null}

        <Pressable
          onPress={() => vm.signIn()}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          style={[styles.submit, disabled && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>
            {vm.isSubmitting ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: -8, marginBottom: 8 },
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
  },
  error: { color: '#DC2626', fontSize: 14 },
  submit: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
