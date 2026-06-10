// src/ui/components/Field.tsx
//
// Token-driven text field. States: default / focus (green border + ring) /
// filled / error (red border) / disabled. Supports prefix ($), suffix, hint and
// error. Uses the mono font for numeric input (prefix or decimal keyboard).

import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { colors, fonts, radii } from '@/ui/styles/tokens';

import { Txt } from './Txt';

type Props = {
  label?: string;
  hint?: string;
  error?: string | null;
  prefix?: string;
  suffix?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  secureTextEntry?: boolean;
  accessibilityLabel?: string;
};

export function Field({
  label,
  hint,
  error,
  prefix,
  suffix,
  value,
  onChangeText,
  placeholder,
  disabled,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  accessibilityLabel,
}: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.down : focused ? colors.up : colors.hair2;
  const numeric = !!prefix || keyboardType === 'decimal-pad';

  return (
    <View style={styles.wrap}>
      {label ? (
        <Txt variant="caption" color="ink2" style={styles.label}>
          {label}
        </Txt>
      ) : null}

      <View
        style={[
          styles.box,
          {
            borderColor,
            backgroundColor: disabled ? 'transparent' : colors.bg2,
            opacity: disabled ? 0.5 : 1,
          },
          focused && !error ? styles.ring : null,
        ]}
      >
        {prefix ? (
          <Txt
            style={{
              fontFamily: fonts.mono.semibold,
              fontSize: 17,
              color: colors.ink2,
            }}
          >
            {prefix}
          </Txt>
        ) : null}

        <TextInput
          style={[
            styles.input,
            {
              fontFamily: numeric ? fonts.mono.semibold : fonts.sans.semibold,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.ink3}
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={accessibilityLabel ?? label}
        />

        {suffix ? (
          <Txt variant="caption" color="ink3">
            {suffix}
          </Txt>
        ) : null}
      </View>

      {error ? (
        <Txt variant="caption" color="down">
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="caption" color="ink3">
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { letterSpacing: 0.1, textTransform: 'none' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 54,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: radii.md,
  },
  ring: {
    // Approximates the web's 4px focus ring.
    borderColor: colors.up,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: -0.2,
    padding: 0,
  },
});
