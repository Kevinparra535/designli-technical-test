// src/ui/components/BreathingGlow.tsx
//
// Ambient "breathing" glow — soft color orbs that pulse (scale + opacity) AND
// float (translate) on independent loops, so the motion feels alive rather than
// metronomic. Meant to sit BEHIND a BlurView so the hard circles read as a
// living, defocused halo. Native-driven (Animated API).

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '@/ui/styles/tokens';

export type GlowOrb = {
  color: string;
  size: number;
  x: number;
  y: number;
  /** Half-pulse duration in ms (full inhale+exhale = 2×). */
  breathDuration: number;
  /** Half-float duration in ms — kept different from breath for organic drift. */
  driftDuration: number;
  driftX: number;
  driftY: number;
  delay: number;
};

const DEFAULT_ORBS: GlowOrb[] = [
  {
    color: colors.up,
    size: 340,
    x: -70,
    y: -140,
    breathDuration: 2600,
    driftDuration: 6000,
    driftX: 34,
    driftY: 40,
    delay: 0,
  },
  {
    color: colors.up2,
    size: 280,
    x: 150,
    y: -90,
    breathDuration: 3300,
    driftDuration: 7400,
    driftX: -40,
    driftY: -30,
    delay: 500,
  },
  {
    color: colors.info,
    size: 240,
    x: 60,
    y: 20,
    breathDuration: 4000,
    driftDuration: 8600,
    driftX: 30,
    driftY: 34,
    delay: 1100,
  },
];

function Orb({ orb }: { orb: GlowOrb }) {
  const breath = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

    const breathLoop = pulse(breath, orb.breathDuration);
    const driftLoop = pulse(drift, orb.driftDuration);
    const timer = setTimeout(() => {
      breathLoop.start();
      driftLoop.start();
    }, orb.delay);

    return () => {
      clearTimeout(timer);
      breathLoop.stop();
      driftLoop.stop();
    };
  }, [breath, drift, orb.breathDuration, orb.driftDuration, orb.delay]);

  const b = (from: number, to: number) =>
    breath.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  const d = (from: number, to: number) =>
    drift.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: orb.x,
        top: orb.y,
        width: orb.size,
        height: orb.size,
        borderRadius: orb.size / 2,
        backgroundColor: orb.color,
        opacity: b(0.28, 0.72),
        transform: [
          { translateX: d(-orb.driftX, orb.driftX) },
          { translateY: d(orb.driftY, -orb.driftY) },
          { scale: b(0.78, 1.32) },
        ],
      }}
    />
  );
}

export function BreathingGlow({ orbs = DEFAULT_ORBS }: { orbs?: GlowOrb[] }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {orbs.map((orb, i) => (
        <Orb key={i} orb={orb} />
      ))}
    </View>
  );
}
