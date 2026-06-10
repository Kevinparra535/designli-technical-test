// src/ui/components/Button.tsx
//
// Token-driven button. Variants: primary (brand green, glow) / secondary /
// ghost / danger. Sizes lg(54)/md(44)/sm(36). Handles loading + disabled and
// the design's press feedback (scale 0.975).

import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, fonts, radii, shadows } from '@/ui/styles/tokens';

import { PressableScale } from './PressableScale';
import { Spinner } from './Spinner';
import { Txt } from './Txt';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  leading?: ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.up, fg: colors.upInk, border: 'transparent' },
  secondary: { bg: colors.bg4, fg: colors.ink, border: colors.hair2 },
  ghost: { bg: 'transparent', fg: colors.ink, border: colors.hair2 },
  danger: { bg: colors.downDim, fg: colors.down, border: 'transparent' },
};

const HEIGHTS: Record<Size, number> = { lg: 54, md: 44, sm: 36 };
const FONT_SIZES: Record<Size, number> = { lg: 16.5, md: 15, sm: 13.5 };
const PADS: Record<Size, number> = { lg: 20, md: 16, sm: 12 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  full,
  leading,
  style,
  accessibilityLabel,
}: Props) {
  const v = VARIANTS[variant];
  const isDisabled = !!disabled || !!loading;

  return (
    <PressableScale
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={[
        styles.base,
        {
          height: HEIGHTS[size],
          paddingHorizontal: PADS[size],
          backgroundColor: v.bg,
          borderColor: v.border,
          width: full ? '100%' : undefined,
        },
        variant === 'primary' && !isDisabled ? shadows.primaryGlow : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <Spinner size={18} color={v.fg} />
      ) : (
        <View style={styles.row}>
          {leading}
          <Txt
            style={{
              fontFamily: fonts.sans.bold,
              fontSize: FONT_SIZES[size],
              color: v.fg,
              letterSpacing: -0.2,
            }}
          >
            {label}
          </Txt>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.4 },
});
