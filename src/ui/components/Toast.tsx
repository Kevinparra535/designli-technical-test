// src/ui/components/Toast.tsx
//
// Drop-in toast (push-banner motion). Mount it to show; it slides + fades in
// from the top, auto-dismisses after `duration`, then calls onHide so the
// parent can unmount it. Tone drives the accent color.

import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { motion } from '@/ui/theme/motion';
import { colors, radii, shadows } from '@/ui/theme/tokens';

import { Txt } from './Txt';

type Tone = 'up' | 'down' | 'warn' | 'neutral';

type Props = {
  message: string;
  tone?: Tone;
  icon?: ReactNode;
  duration?: number;
  onHide?: () => void;
};

const ACCENT: Record<Tone, string> = {
  up: colors.up,
  down: colors.down,
  warn: colors.warn,
  neutral: colors.ink2,
};

export function Toast({
  message,
  tone = 'neutral',
  icon,
  duration = 2200,
  onHide,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.durations.drop,
      easing: motion.easings.drop,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        easing: motion.easings.standard,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [progress, duration, onHide]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.card, { borderColor: ACCENT[tone] }]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Txt variant="bodyStrong" numberOfLines={2} style={styles.msg}>
          {message}
        </Txt>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bg2,
    borderRadius: radii.lg,
    borderWidth: 1,
    ...shadows.sheet,
  },
  icon: { marginRight: 2 },
  msg: { flexShrink: 1 },
});
