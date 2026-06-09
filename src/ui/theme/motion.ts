// src/ui/theme/motion.ts
//
// Motion tokens — the single source of truth for micro-interactions, ported
// from the design handoff's animation specs (reference/README.md). All UI
// motion (press, entrance, sheet, toast) pulls timings/easings from here so the
// app feels consistent. Built on the RN Animated API (no native/babel config).

import { Easing } from 'react-native';

import { durations } from './tokens';

export const motion = {
  durations,

  // Easing curves matching the handoff cubic-beziers.
  easings: {
    standard: Easing.out(Easing.cubic),
    sheet: Easing.bezier(0.2, 0.9, 0.25, 1), // bottom sheet rise
    drop: Easing.bezier(0.2, 1.1, 0.3, 1), // toast / push banner drop
    pop: Easing.bezier(0.2, 1.2, 0.4, 1), // success check / dialog
  },

  // Animated.spring configs.
  spring: {
    press: { speed: 50, bounciness: 0 }, // snappy scale, no overshoot
    gentle: { speed: 16, bounciness: 6 },
  },

  // Press feedback: every tappable surface scales to this on press-in.
  pressScale: 0.97,

  // Entrance: fade + slide-up, staggered per list index.
  appear: { translateY: 10, stagger: 45 },
} as const;
