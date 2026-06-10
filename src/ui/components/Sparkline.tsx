// src/ui/components/Sparkline.tsx
//
// Mini area chart (react-native-svg). Color is semantic: green when the series
// ends up, red when it ends down — unless an explicit `up`/`stroke` is given.

import { useId } from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '@/ui/styles/tokens';

type Props = {
  data: number[];
  width?: number;
  height?: number;
  up?: boolean;
  stroke?: string;
  fill?: boolean;
  strokeWidth?: number;
};

function buildSpark(vals: number[], w: number, h: number, pad = 2) {
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
  return { line, area };
}

export function Sparkline({
  data,
  width = 72,
  height = 30,
  up,
  stroke,
  fill = true,
  strokeWidth = 2,
}: Props) {
  // Strip ':' from React's useId — invalid inside an SVG url(#id) reference.
  const gid = `sl${useId().replace(/:/g, '')}`;
  if (!data || data.length < 2) return null;

  const isUp = up === undefined ? data[data.length - 1] >= data[0] : up;
  const col = stroke ?? (isUp ? colors.up : colors.down);
  const { line, area } = buildSpark(data, width, height, 2);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <>
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={col} stopOpacity={0.22} />
              <Stop offset="1" stopColor={col} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill={`url(#${gid})`} />
        </>
      )}
      <Path
        d={line}
        fill="none"
        stroke={col}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
