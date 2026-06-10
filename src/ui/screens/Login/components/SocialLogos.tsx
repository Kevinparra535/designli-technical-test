// src/ui/screens/Login/SocialLogos.tsx
//
// Brand logos for the social sign-in buttons. These use fixed brand colors
// (Apple white, Google's four-color mark) — not theme tokens.

import Svg, { Path } from 'react-native-svg';

import { colors } from '@/ui/styles/tokens';

type Props = { size?: number };

export function AppleLogo({ size = 19 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={colors.ink}
        d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7 1.9-1.1 2.6-2.1c.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.5Z"
      />
      <Path
        fill={colors.ink}
        d="M14.6 6.2c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2Z"
      />
    </Svg>
  );
}

export function GoogleLogo({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z"
      />
      <Path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.6c-.9.6-2 1-3.3 1-2.6 0-4.7-1.7-5.5-4.1H3.1v2.6C4.8 19.8 8.1 22 12 22Z"
      />
      <Path
        fill="#FBBC05"
        d="M6.5 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5l3.4-2.6Z"
      />
      <Path
        fill="#EA4335"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.5l3.4 2.6C7.3 7.7 9.4 6 12 6Z"
      />
    </Svg>
  );
}
