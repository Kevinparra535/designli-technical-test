// src/ui/components/Marquee.tsx
//
// Infinite horizontal scroller (ticker tape). Renders its children twice and
// loops a translateX over the width of one copy, so the second copy seamlessly
// takes over when the first scrolls off. Native-driven, constant speed.
//
// Note: for a gap-free loop the children should be at least as wide as the
// container — pass enough items.

import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

type Props = {
  children: ReactNode;
  /** Scroll speed in pixels per second. */
  speed?: number;
  style?: StyleProp<ViewStyle>;
};

export function Marquee({ children, speed = 40, style }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (width === 0) return undefined;
    translateX.setValue(0);
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -width,
        duration: (width / speed) * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [width, speed, translateX]);

  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        <View
          style={styles.copy}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
          {children}
        </View>
        <View style={styles.copy}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  track: { flexDirection: 'row' },
  copy: { flexDirection: 'row' },
});
