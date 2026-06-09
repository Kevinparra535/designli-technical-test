// src/ui/components/BrandMark.tsx
//
// The app isotype: a rounded square with the brand green gradient and an
// upward-trend arrow. Carries the primary green glow.

import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors, shadows } from '@/ui/theme/tokens';

type Props = { size?: number };

export function BrandMark({ size = 56 }: Props) {
  // Strip ':' from React's useId — invalid inside an SVG url(#id) reference.
  const gid = `bm${useId().replace(/:/g, '')}`;
  const r = size * 0.28;

  return (
    <View style={[styles.glow, { width: size, height: size, borderRadius: r }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.up} />
            <Stop offset="1" stopColor={colors.up2} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="24"
          height="24"
          rx="6.7"
          fill={`url(#${gid})`}
        />
        <Path
          d="M3 16l4.5-5 3.5 3.5L20 6"
          stroke={colors.upInk}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M15 6h5v5"
          stroke={colors.upInk}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    ...shadows.primaryGlow,
  },
});
