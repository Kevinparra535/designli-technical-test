// src/ui/components/Icon.tsx
//
// Stroke-glyph icon set ported from the design handoff (reference/ui.jsx) to
// react-native-svg. All glyphs use a 24×24 viewBox. `color` drives stroke;
// `fill` (for tab icons in their active state) drives the filled area.

import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/ui/theme/tokens';

export type IconName =
  | 'bell'
  | 'bellPlus'
  | 'chevR'
  | 'chevL'
  | 'search'
  | 'arrowUp'
  | 'arrowDown'
  | 'plus'
  | 'check'
  | 'x'
  | 'home'
  | 'pulse'
  | 'bellTab'
  | 'user'
  | 'pause'
  | 'bolt'
  | 'trash';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
};

export function Icon({
  name,
  size = 22,
  color = colors.ink,
  fill = 'none',
  strokeWidth,
}: Props) {
  const sw = strokeWidth;
  const common = {
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {renderGlyph(name, common, sw, color, fill)}
    </Svg>
  );
}

function renderGlyph(
  name: IconName,
  c: {
    stroke: string;
    strokeLinecap: 'round';
    strokeLinejoin: 'round';
    fill: 'none';
  },
  sw: number | undefined,
  color: string,
  fill: string,
) {
  switch (name) {
    case 'bell':
      return (
        <>
          <Path
            {...c}
            strokeWidth={sw ?? 1.7}
            d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z"
          />
          <Path {...c} strokeWidth={sw ?? 1.7} d="M10.3 19a2 2 0 0 0 3.4 0" />
        </>
      );
    case 'bellPlus':
      return (
        <>
          <Path
            {...c}
            strokeWidth={sw ?? 1.7}
            d="M18 9.5a6 6 0 0 0-9.9-4.6M5.8 8.2A6 6 0 0 0 6 9c0 5-2 6.5-2 6.5h13"
          />
          <Path {...c} strokeWidth={sw ?? 1.7} d="M10.3 19a2 2 0 0 0 3.4 0" />
          <Path {...c} strokeWidth={sw ?? 1.7} d="M19 3.5v5M16.5 6h5" />
        </>
      );
    case 'chevR':
      return <Path {...c} strokeWidth={sw ?? 2} d="M9 5l7 7-7 7" />;
    case 'chevL':
      return <Path {...c} strokeWidth={sw ?? 2} d="M15 5l-7 7 7 7" />;
    case 'search':
      return (
        <>
          <Circle
            cx="11"
            cy="11"
            r="7"
            stroke={color}
            strokeWidth={sw ?? 1.8}
            fill="none"
          />
          <Path {...c} strokeWidth={sw ?? 1.8} d="M20 20l-3.5-3.5" />
        </>
      );
    case 'arrowUp':
      return <Path {...c} strokeWidth={sw ?? 2.2} d="M7 17L17 7M9 7h8v8" />;
    case 'arrowDown':
      return <Path {...c} strokeWidth={sw ?? 2.2} d="M7 7l10 10M17 9v8H9" />;
    case 'plus':
      return <Path {...c} strokeWidth={sw ?? 2.2} d="M12 5v14M5 12h14" />;
    case 'check':
      return <Path {...c} strokeWidth={sw ?? 2.4} d="M5 12.5l4.5 4.5L19 6.5" />;
    case 'x':
      return <Path {...c} strokeWidth={sw ?? 2} d="M6 6l12 12M18 6L6 18" />;
    case 'home':
      return (
        <Path
          {...c}
          fill={fill}
          strokeWidth={sw ?? 1.8}
          d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z"
        />
      );
    case 'pulse':
      return (
        <Path
          {...c}
          strokeWidth={sw ?? 1.8}
          d="M3 12h3l2.5-6 4 13 3-8 1.8 3H21"
        />
      );
    case 'bellTab':
      return (
        <>
          <Path
            {...c}
            fill={fill}
            strokeWidth={sw ?? 1.8}
            d="M18 9.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z"
          />
          <Path {...c} strokeWidth={sw ?? 1.8} d="M10.3 19.5a2 2 0 0 0 3.4 0" />
        </>
      );
    case 'user':
      return (
        <>
          <Circle
            cx="12"
            cy="8.5"
            r="3.5"
            stroke={color}
            strokeWidth={sw ?? 1.8}
            fill={fill}
          />
          <Path
            {...c}
            strokeWidth={sw ?? 1.8}
            d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"
          />
        </>
      );
    case 'pause':
      return <Path {...c} strokeWidth={sw ?? 2.2} d="M9 5v14M15 5v14" />;
    case 'bolt':
      return (
        <Path
          stroke={color}
          fill={color}
          strokeLinejoin="round"
          strokeWidth={sw ?? 1.4}
          d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z"
        />
      );
    case 'trash':
      return (
        <Path
          {...c}
          strokeWidth={sw ?? 1.7}
          d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"
        />
      );
    default:
      return null;
  }
}
