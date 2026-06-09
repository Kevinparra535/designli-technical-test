// src/ui/components/Spinner.tsx
//
// Ring spinner (2.2px stroke, transparent top) matching the design's loading
// affordance. Pure presentational; spins via Animated.loop.

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { colors, durations } from '@/ui/theme/tokens';

type Props = {
  size?: number;
  color?: string;
};

export function Spinner({ size = 18, color = colors.ink }: Props) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: durations.spin,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          borderTopColor: 'transparent',
          transform: [{ rotate }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2.2,
  },
});
