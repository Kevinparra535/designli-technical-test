// src/ui/components/Appear.tsx
//
// Entrance wrapper: fades + slides its children up on mount. Pass `index` for a
// staggered reveal in lists (each row enters slightly after the previous one),
// or `delay` for an explicit offset. Native-driven.

import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { motion } from '@/ui/theme/motion';

type Props = {
  children: ReactNode;
  /** List position — drives the stagger delay (index * 45ms). */
  index?: number;
  /** Explicit delay (ms); overrides the index-based stagger. */
  delay?: number;
  /** Slide distance in px (default 10). */
  translateY?: number;
  style?: StyleProp<ViewStyle>;
};

export function Appear({
  children,
  index = 0,
  delay,
  translateY = motion.appear.translateY,
  style,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: motion.durations.pop,
      delay: delay ?? index * motion.appear.stagger,
      easing: motion.easings.standard,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, index, delay]);

  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [translateY, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
