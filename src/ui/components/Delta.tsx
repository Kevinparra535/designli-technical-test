// src/ui/components/Delta.tsx
//
// Percent-change badge with a directional arrow and semantic color. Green = up,
// red = down. `solid` fills the badge (used on detail headers).

import { StyleSheet, View } from 'react-native';

import { colors, fonts, radii } from '@/ui/theme/tokens';

import { Icon } from './Icon';
import { Txt } from './Txt';

type Props = {
  /** Percent change, e.g. 3.42 or -2.13. */
  pct: number;
  size?: 'sm' | 'md';
  solid?: boolean;
};

export function Delta({ pct, size = 'md', solid = false }: Props) {
  const up = pct >= 0;
  const small = size === 'sm';
  const fg = solid
    ? up
      ? colors.upInk
      : colors.downInk
    : up
      ? colors.up
      : colors.down;
  const bg = solid
    ? up
      ? colors.up
      : colors.down
    : up
      ? colors.upDim
      : colors.downDim;
  const glyph = small ? 11 : 13;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: small ? 2 : 4,
          paddingHorizontal: small ? 6 : 8,
        },
      ]}
    >
      <Icon name={up ? 'arrowUp' : 'arrowDown'} size={glyph} color={fg} />
      <Txt
        style={{
          fontFamily: fonts.mono.semibold,
          fontSize: small ? 11 : 12.5,
          color: fg,
          letterSpacing: -0.2,
        }}
      >
        {Math.abs(pct).toFixed(2)}%
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
});
