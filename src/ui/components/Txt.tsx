// src/ui/components/Txt.tsx
//
// Typography primitive. Maps a `variant` to token-driven font family / size /
// spacing so screens never hardcode type styles. Custom fonts encode weight in
// the family name (see theme/tokens.ts), so we set fontFamily, not fontWeight.

import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, type ColorToken, fonts } from '@/ui/theme/tokens';

export type TxtVariant =
  | 'display' // big price / hero number (sans)
  | 'displayMono' // big price (mono, tabular)
  | 'title' // screen title
  | 'headline' // section / card title
  | 'body' // default text
  | 'bodyStrong' // emphasized body
  | 'price' // inline mono price (tabular)
  | 'label' // UPPERCASE tracked label
  | 'caption'; // small faint text

type Props = TextProps & {
  variant?: TxtVariant;
  color?: ColorToken;
  align?: TextStyle['textAlign'];
};

export function Txt({ variant = 'body', color, align, style, ...rest }: Props) {
  return (
    <Text
      style={[
        styles[variant],
        color ? { color: colors[color] } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    />
  );
}

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

const styles = StyleSheet.create({
  display: {
    fontFamily: fonts.sans.extrabold,
    fontSize: 38,
    letterSpacing: -1,
    color: colors.ink,
  },
  displayMono: {
    fontFamily: fonts.mono.bold,
    fontSize: 38,
    letterSpacing: -1,
    color: colors.ink,
    ...tabular,
  },
  title: {
    fontFamily: fonts.sans.extrabold,
    fontSize: 26,
    letterSpacing: -0.7,
    color: colors.ink,
  },
  headline: {
    fontFamily: fonts.sans.bold,
    fontSize: 16.5,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.sans.medium,
    fontSize: 15,
    color: colors.ink,
  },
  bodyStrong: {
    fontFamily: fonts.sans.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  price: {
    fontFamily: fonts.mono.semibold,
    fontSize: 14.5,
    color: colors.ink,
    ...tabular,
  },
  label: {
    fontFamily: fonts.sans.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.ink3,
  },
  caption: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: colors.ink3,
  },
});
