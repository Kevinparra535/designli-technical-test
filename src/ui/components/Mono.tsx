// src/ui/components/Mono.tsx
//
// Ticker monogram avatar — first two letters of the symbol, colored per symbol.
// Unknown symbols fall back to a neutral ink color.

import { StyleSheet, View } from 'react-native';

import { colors, fonts } from '@/ui/theme/tokens';

import { Txt } from './Txt';

const PALETTE: Record<string, string> = {
  NVDA: '#1FE08A',
  AAPL: '#E2E6EA',
  TSLA: '#FF5C6C',
  MSFT: '#5AA9FF',
  COIN: '#5B7BFF',
  AMZN: '#FFB23E',
  META: '#5AA9FF',
  GOOGL: '#E2E6EA',
  AMD: '#FF8A5C',
  SPY: '#98A2AD',
};

type Props = {
  symbol: string;
  size?: number;
};

export function Mono({ symbol, size = 40 }: Props) {
  const color = PALETTE[symbol] ?? colors.ink2;
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size * 0.3 },
      ]}
    >
      <Txt
        style={{
          fontFamily: fonts.mono.bold,
          fontSize: size * 0.3,
          color,
          letterSpacing: -0.5,
        }}
      >
        {symbol.slice(0, 2)}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexShrink: 0,
    backgroundColor: colors.bg4,
    borderWidth: 1,
    borderColor: colors.hair,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
