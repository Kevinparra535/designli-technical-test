// src/ui/theme/tokens.ts
//
// Single source of styling truth for the app — ported from the Designli
// "Stock Alerts" design handoff (reference/data.js). NO hex/magic numbers in
// screens or components: import from here.
//
// Theme: dark "trading terminal". Semantic rule — green = up + primary brand
// action; red = down; amber = alert fired. Never use green/red decoratively.

export const colors = {
  // Surfaces (cool near-black)
  bg: '#0A0C0F', // app background
  bg2: '#101317', // elevated card
  bg3: '#171B20', // higher / pressed
  bg4: '#1F242A', // input / chip
  hair: 'rgba(255,255,255,0.07)', // subtle divider / border
  hair2: 'rgba(255,255,255,0.12)', // stronger border

  // Text
  ink: '#F2F5F7', // primary
  ink2: '#98A2AD', // secondary / muted
  ink3: '#5A636D', // tertiary / faint
  ink4: '#3A424B', // disabled

  // Semantics
  up: '#1FE08A', // positive / brand
  up2: '#12B873', // brand gradient end (isotype)
  upDim: 'rgba(31,224,138,0.14)',
  upInk: '#062613', // text on solid green (primary button)
  down: '#FF5C6C', // negative
  downDim: 'rgba(255,92,108,0.14)',
  downInk: '#2A0008', // text on solid red
  warn: '#FFB23E', // triggered / alert fired
  warnDim: 'rgba(255,178,62,0.15)',
  info: '#5AA9FF',
} as const;

export const radii = {
  sm: 10, // chips inside segmented
  md: 14, // inputs, buttons
  lg: 20, // cards
  xl: 28, // sheets (top corners)
  pill: 999, // badges, avatars
} as const;

// Base-4 spacing scale.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Horizontal screen padding (24 on login/onboarding). */
export const screenPad = 20;

// Font family names match the keys passed to useFonts() in theme/fonts.ts.
// Each weight is its OWN family (custom fonts don't honor fontWeight in RN).
export const fonts = {
  sans: {
    regular: 'HankenGrotesk_400Regular',
    medium: 'HankenGrotesk_500Medium',
    semibold: 'HankenGrotesk_600SemiBold',
    bold: 'HankenGrotesk_700Bold',
    extrabold: 'HankenGrotesk_800ExtraBold',
  },
  mono: {
    regular: 'JetBrainsMono_400Regular',
    medium: 'JetBrainsMono_500Medium',
    semibold: 'JetBrainsMono_600SemiBold',
    bold: 'JetBrainsMono_700Bold',
  },
} as const;

// iOS shadows + Android elevation.
export const shadows = {
  // Green glow under the primary button.
  primaryGlow: {
    shadowColor: colors.up,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  // Sheets / toasts / push banners.
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
} as const;

// Interaction timings (ms).
export const durations = {
  spin: 700,
  sheet: 320,
  drop: 350,
  pop: 320,
  press: 120,
} as const;

export type ColorToken = keyof typeof colors;
