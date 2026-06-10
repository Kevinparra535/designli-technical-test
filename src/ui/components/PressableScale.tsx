// src/ui/components/PressableScale.tsx
//
// The app's standard tappable surface: a Pressable that springs to a slightly
// smaller scale on press-in and back on release. Every interactive element
// (buttons, rows, chips, icon buttons) should use this so press feedback is
// consistent across the app. Native-driven — runs off the JS thread.

import { useRef } from 'react';
import {
  Animated,
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { motion } from '@/ui/styles/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Scale target on press-in (default 0.97 from motion tokens). */
  scaleTo?: number;
};

export function PressableScale({
  style,
  scaleTo = motion.pressScale,
  disabled,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      ...motion.spring.press,
    }).start();

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e: GestureResponderEvent) => {
        if (!disabled) spring(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        spring(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
