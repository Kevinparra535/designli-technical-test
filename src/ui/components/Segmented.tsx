// src/ui/components/Segmented.tsx
//
// 2–3 option segmented control with semantic tone per option (up/down/neutral).
// The active segment tints to its tone; inactive options stay muted.

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, radii } from '@/ui/styles/tokens';

import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

export type SegmentTone = 'up' | 'down' | 'neutral';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  tone?: SegmentTone;
  icon?: ReactNode;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

function activeColors(tone: SegmentTone): { bg: string; fg: string } {
  if (tone === 'up') return { bg: colors.upDim, fg: colors.up };
  if (tone === 'down') return { bg: colors.downDim, fg: colors.down };
  return { bg: colors.bg4, fg: colors.ink };
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const active = o.value === value;
        const tone = o.tone ?? 'neutral';
        const { bg, fg } = activeColors(tone);
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(o.value)}
            scaleTo={0.96}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.item,
              { backgroundColor: active ? bg : 'transparent' },
            ]}
          >
            {o.icon}
            <Txt
              style={{
                fontFamily: fonts.sans.bold,
                fontSize: 14.5,
                color: active ? fg : colors.ink2,
                letterSpacing: -0.2,
              }}
            >
              {o.label}
            </Txt>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hair,
  },
  item: {
    flex: 1,
    height: 44,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
