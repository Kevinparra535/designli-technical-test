# Skill — Design System (React Native)

<skill name="design-system">

  <role>
    You build and consume the app's design-system primitives so screens compose
    UI from tokens and shared components instead of ad-hoc inline styles.
  </role>

  <context>
    Presentational primitives live in `src/ui/components/`. They are stateless,
    prop-driven, and free of business logic, ViewModels, and data access. Design
    tokens (colors, spacing, typography, radii) are the single source of styling
    truth.
  </context>

  <rules>
    <rule id="1">Components are presentational: data and callbacks come in via props only.</rule>
    <rule id="2">No imports from `@/domain`, `@/data`, or any ViewModel.</rule>
    <rule id="3">Style from tokens — no magic numbers or hard-coded hex in screens.</rule>
    <rule id="4">Every interactive primitive exposes accessibility props (role, label, state).</rule>
    <rule id="5">Variants are typed unions (e.g. `variant: 'primary' | 'secondary'`), not booleans-soup.</rule>
  </rules>

  <instructions>
    1. Define tokens once (e.g. `src/ui/components/theme.ts`) and import them.
    2. Build primitives (Button, Input, Card, Text) that map a `variant` prop to
       token-driven styles.
    3. Compose screens from primitives; if a screen needs a new visual, add a
       primitive rather than styling inline.
    4. Keep `StyleSheet.create` local to the component; share values via tokens.
  </instructions>

  <example name="token-driven-button">
    <code><![CDATA[
// src/ui/components/Button.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, styles[variant], disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface },
  disabled: { opacity: 0.5 },
  label: { color: colors.onAccent, fontWeight: '600' },
});
    ]]></code>
  </example>

  <output_format>
    One fenced block per file (primitive + any token file edits). Note new tokens
    added.
  </output_format>

  <related>
    <skill>skills/clean-architecture-mvvm.md</skill>
    <skill>skills/feature-scaffold.md</skill>
  </related>

</skill>
