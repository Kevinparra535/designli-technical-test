# Skill — Design System (React Native)

<skill name="design-system">

  <role>
    You build and consume the app's design-system primitives so every screen
    composes UI from tokens, shared components, and shared motion — never ad-hoc
    inline styles or one-off animations. This is the enforceable contract for the
    "Designli · Stock Alerts" dark trading-terminal design.
  </role>

  <context>
    The design system lives in two folders and is the single source of styling
    + motion truth:

      src/ui/theme/      → tokens.ts (colors, radii, spacing, fonts, shadows,
                           durations), motion.ts (easings, springs, press/appear),
                           fonts.ts (useFonts asset map)
      src/ui/components/  → presentational primitives, re-exported from the
                           barrel '@/ui/components'

    Theme: dark, near-black surfaces. Fonts are loaded at the app root via
    useFonts(fontAssets) — each weight is its OWN family name (custom fonts do
    NOT honor fontWeight in RN), so type is set through the Txt primitive, never
    raw <Text> + fontWeight.

    Primitives (import from '@/ui/components'):
      Txt · Button · Field · Segmented · Delta · Sparkline · Mono · Spinner ·
      Icon · PressableScale · Appear · Toast

    Motion (import from '@/ui/styles/motion'): all timings/easings/springs and the
    press-scale + entrance-stagger constants. The Animated API is the engine (no
    reanimated/babel/native config).
  </context>

  <rules>
    <rule id="1">Components are presentational: data and callbacks come in via props only. No domain/data/ViewModel imports.</rule>
    <rule id="2">Style from tokens — NO hard-coded hex, rgba, or magic numbers in screens or components. Import from '@/ui/styles/tokens'.</rule>
    <rule id="3">All text uses the Txt primitive (variant-driven). Never raw <Text> with inline fontFamily/fontWeight/fontSize.</rule>
    <rule id="4">Semantic color is meaning, not decoration: green (up) = price up AND the primary brand action; red (down) = price down; amber (warn) = alert fired. Never use up/down/warn decoratively.</rule>
    <rule id="5">Every tappable surface (buttons, rows, chips, icon buttons, tabs) uses PressableScale — never a raw Pressable/TouchableOpacity — so press feedback is uniform.</rule>
    <rule id="6">All motion pulls from '@/ui/styles/motion' (durations, easings, springs, pressScale, appear). NEVER inline an animation duration/easing literal in a screen or component.</rule>
    <rule id="7">List items mount through Appear (pass index for the stagger). Transient confirmations use Toast. Loading uses Spinner. Don't hand-roll these.</rule>
    <rule id="8">Variants are typed unions (e.g. variant: 'primary' | 'secondary' | 'ghost' | 'danger'), not boolean soup. Interactive primitives expose accessibility props (role, label, state).</rule>
    <rule id="9">Numbers/prices use the mono font + tabular-nums (Txt 'price'/'displayMono' variants). Never render a price in the sans family.</rule>
  </rules>

  <instructions>
    When adding or restyling UI:
    1. Reach for an existing primitive first. If a screen needs a new visual,
       add a primitive (token- and motion-driven) rather than styling inline.
    2. New tokens go in src/ui/theme/tokens.ts; new motion presets in
       src/ui/theme/motion.ts. Consume by name, never by literal value.
    3. Keep StyleSheet.create local to the component; share values via tokens.
    4. A new tappable element wraps PressableScale; a new list animates via
       Appear; a new font weight is added to fonts.ts AND tokens.fonts.
    5. Self-check against skills/pr-checklist.md before finishing.
  </instructions>

  <forbidden>
    <item>Hard-coded hex / rgba / px literals in screens (use tokens).</item>
    <item>Raw <Text> with inline font styles (use Txt + variant).</item>
    <item>Raw Pressable / TouchableOpacity for tappable surfaces (use PressableScale).</item>
    <item>Inline animation duration/easing/spring literals (use motion tokens).</item>
    <item>Rendering a price/number in the sans font or without tabular-nums.</item>
    <item>Importing from @/domain, @/data, or a ViewModel inside a component.</item>
  </forbidden>

  <example name="token-and-motion-driven-button">
    <code><![CDATA[
// Primitives compose tokens + motion — screens just pass props.
import { StyleSheet, View } from 'react-native';
import { colors, fonts, radii, shadows } from '@/ui/styles/tokens';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  const v = VARIANTS[variant];               // typed union → token colors
  return (
    <PressableScale                          // uniform press-scale (motion token)
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border },
        variant === 'primary' ? shadows.primaryGlow : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Txt style={{ fontFamily: fonts.sans.bold, color: v.fg }}>{label}</Txt>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { height: 54, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
});
    ]]></code>
  </example>

  <example name="staggered-list-with-feedback">
    <code><![CDATA[
import { Appear, Toast } from '@/ui/components';

{items.map((item, i) => (
  <Appear key={item.id} index={i}>     {/* fade + slide-up, staggered */}
    <Row item={item} />
  </Appear>
))}

{toast && <Toast message={toast} tone="up" onHide={() => setToast(null)} />}
    ]]></code>
  </example>

  <output_format>
    One fenced block per file (primitive + any token/motion file edits). Note new
    tokens/motion presets added and which of the 9 rules the change touches.
  </output_format>

  <related>
    <skill>skills/clean-architecture-mvvm.md</skill>
    <skill>skills/feature-scaffold.md</skill>
    <reference>.design-handoff/design_handoff_stock_alerts/README.md</reference>
  </related>

</skill>
