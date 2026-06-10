// src/ui/components/PriceChart.tsx
//
// Larger area chart for the stock detail screen (react-native-svg). Renders the
// price line + gradient fill, an end-point halo, and — when an alert target is
// given — a dashed amber guide line with the target label. Responsive width via
// a fixed viewBox scaled to 100%.

import { useId } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { colors, fonts } from '@/ui/styles/tokens';

type Props = {
  data: number[];
  up: boolean;
  target?: number | null;
  height?: number;
};

const VIEW_W = 340;
const PAD = 6;

function build(vals: number[], w: number, h: number, pad: number) {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const stepX = (w - pad * 2) / (vals.length - 1);
  const pts = vals.map(
    (v, i) =>
      [pad + i * stepX, pad + (h - pad * 2) * (1 - (v - min) / span)] as const,
  );
  const line = pts
    .map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1))
    .join(' ');
  const area = line + ` L${(w - pad).toFixed(1)} ${h} L${pad} ${h} Z`;
  return { line, area, pts, min, max, span };
}

export function PriceChart({ data, up, target, height = 200 }: Props) {
  const gid = `pc${useId().replace(/:/g, '')}`;

  if (!data || data.length < 2) {
    return <View style={{ height }} />;
  }

  const col = up ? colors.up : colors.down;
  const { line, area, pts, min, max, span } = build(data, VIEW_W, height, PAD);
  const last = pts[pts.length - 1];

  let targetY: number | null = null;
  if (target != null && target > 0) {
    const clamped = Math.max(min, Math.min(max, target));
    targetY = PAD + (height - PAD * 2) * (1 - (clamped - min) / span);
  }

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${VIEW_W} ${height}`}>
      <Defs>
        <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={col} stopOpacity={0.28} />
          <Stop offset="1" stopColor={col} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Path d={area} fill={`url(#${gid})`} />
      <Path
        d={line}
        fill="none"
        stroke={col}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {targetY != null ? (
        <>
          <Line
            x1={0}
            y1={targetY}
            x2={VIEW_W}
            y2={targetY}
            stroke={colors.warn}
            strokeWidth={1.3}
            strokeDasharray="2 5"
            opacity={0.9}
          />
          <Rect
            x={VIEW_W - 92}
            y={targetY - 11}
            width={92}
            height={22}
            rx={6}
            fill={colors.warnDim}
          />
          <SvgText
            x={VIEW_W - 84}
            y={targetY + 4}
            fill={colors.warn}
            fontFamily={fonts.mono.bold}
            fontSize={11}
          >
            {`▲ $${Math.round(target ?? 0).toLocaleString('en-US')}`}
          </SvgText>
        </>
      ) : null}

      <Circle cx={last[0]} cy={last[1]} r={9} fill={col} opacity={0.18} />
      <Circle cx={last[0]} cy={last[1]} r={4.5} fill={col} />
    </Svg>
  );
}
