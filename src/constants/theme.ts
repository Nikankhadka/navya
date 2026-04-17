import { Platform } from 'react-native';

export function withAlpha(color: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha));

  if (color.startsWith('#')) {
    const hex =
      color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
    const alphaHex = Math.round(clamped * 255)
      .toString(16)
      .padStart(2, '0');

    return `${hex}${alphaHex}`;
  }

  const rgbaMatch = color.match(/^rgba?\(([^)]+)\)$/);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => part.trim());
    const [r, g, b] = parts;
    return `rgba(${r}, ${g}, ${b}, ${clamped})`;
  }

  return color;
}

export const Colors = {
  // Mist & Moss foundation
  canopyBlack: '#0A0D0B',
  surface: '#111412',
  surfaceContainerLowest: '#0C0F0D',
  surfaceContainerLow: '#191C1A',
  surfaceContainer: '#1D201E',
  surfaceContainerHigh: '#272A28',
  surfaceContainerHighest: '#323533',
  surfaceBright: '#373A37',
  surfaceVariant: '#323533',

  primary: '#78DC77',
  primaryContainer: '#4CAF50',
  onPrimary: '#00390A',
  secondary: '#B1CAD7',
  secondaryContainer: '#334A55',
  secondaryFixedDim: '#88A2B0',
  onSecondaryContainer: '#A0B9C5',
  onSurface: '#E1E3DF',
  onSurfaceVariant: '#BECAB9',
  outlineVariant: '#3F4A3C',

  // Compatibility aliases for the current app layer
  bg: '#111412',
  card: '#1D201E',
  cardHover: '#272A28',
  border: '#3F4A3C',
  borderLight: '#59645D',

  // Nature palette aliases
  wetSoil: '#151917',
  barkBrown: '#202520',
  barkBrownSoft: '#2A302A',
  forestGlass: '#323533',
  stoneFog: '#BECAB9',
  youngLeaf: '#9AE196',
  fern: '#6CC56A',
  wildflowerAmber: '#D4BE67',
  berryRed: '#CB7D78',
  riverBlue: '#7DA9BC',
  parchment: '#E7E9E3',
  softLichen: '#C7D0C4',
  mutedBark: '#7B857B',

  // Accent aliases
  accent: '#78DC77',
  accentSoft: '#4CAF50',
  accentMuted: 'rgba(120, 220, 119, 0.16)',

  // Semantic
  green: '#78DC77',
  greenMuted: 'rgba(120, 220, 119, 0.14)',
  orange: '#D4BE67',
  orangeMuted: 'rgba(212, 190, 103, 0.14)',
  red: '#CB7D78',
  redMuted: 'rgba(203, 125, 120, 0.14)',
  blue: '#7DA9BC',
  blueMuted: 'rgba(125, 169, 188, 0.16)',

  // Text aliases
  text: '#E1E3DF',
  textSecondary: '#BECAB9',
  muted: '#94A093',
  dim: '#68726A',

  // Gradients (as arrays for LinearGradient)
  gradientAccent: ['#78DC77', '#4CAF50'] as const,
  gradientGreen: ['#8CE28B', '#58B758'] as const,
  gradientOrange: ['#D9C978', '#A69247'] as const,
  gradientDark: ['#1D201E', '#0C0F0D'] as const,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

export type TypeScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  display: number;
};

const MOBILE_TYPE_SCALE: TypeScale = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  display: 42,
};

const TABLET_TYPE_SCALE: TypeScale = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 19,
  xl: 24,
  xxl: 31,
  xxxl: 38,
  display: 46,
};

const MOBILE_LINE_HEIGHT_SCALE: TypeScale = {
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 34,
  xxxl: 40,
  display: 46,
};

const TABLET_LINE_HEIGHT_SCALE: TypeScale = {
  xs: 17,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 31,
  xxl: 38,
  xxxl: 44,
  display: 50,
};

export const Typography = {
  // Font families
  fontDisplay: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, serif',
  }),
  fontBody: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, sans-serif',
  }),
  fontMono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),

  // Sizes
  size: MOBILE_TYPE_SCALE,
  scale: {
    mobile: MOBILE_TYPE_SCALE,
    tablet: TABLET_TYPE_SCALE,
    desktop: TABLET_TYPE_SCALE,
  },
  lineHeight: {
    mobile: MOBILE_LINE_HEIGHT_SCALE,
    tablet: TABLET_LINE_HEIGHT_SCALE,
    desktop: TABLET_LINE_HEIGHT_SCALE,
  },

  // Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const Motion = {
  quick: 220,
  base: 280,
  slow: 320,
  celebration: 600,
  pressScale: 0.98,
} as const;

export const Shadow = {
  sm: {
    shadowColor: Colors.secondaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 4,
  },
  md: {
    shadowColor: Colors.secondaryContainer,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  lg: {
    shadowColor: Colors.secondaryContainer,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.24,
    shadowRadius: 40,
    elevation: 12,
  },
} as const;

// Responsive helpers
export const MOBILE_MAX_WIDTH = 430;
export const TABLET_BREAKPOINT = 768;

export function getTypeScale(width: number): TypeScale {
  return width >= TABLET_BREAKPOINT ? Typography.scale.tablet : Typography.scale.mobile;
}

export function getLineHeightScale(width: number): TypeScale {
  return width >= TABLET_BREAKPOINT
    ? Typography.lineHeight.tablet
    : Typography.lineHeight.mobile;
}
