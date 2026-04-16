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
  // Base
  bg: '#120F0D',
  surface: '#191511',
  card: '#231C16',
  cardHover: '#2D241D',
  border: '#463728',
  borderLight: '#5B4937',

  // Nature palette
  canopyBlack: '#14120E',
  wetSoil: '#231B14',
  barkBrown: '#3A2A1C',
  barkBrownSoft: '#4C3927',
  forestGlass: '#364133',
  stoneFog: '#C9D1C2',
  youngLeaf: '#9FD36B',
  fern: '#6FA14A',
  wildflowerAmber: '#F2A93B',
  berryRed: '#C65A4B',
  riverBlue: '#6EA8B9',
  parchment: '#F4F1E8',
  softLichen: '#C9C2B4',
  mutedBark: '#8D8477',

  // Accent
  accent: '#9FD36B',
  accentSoft: '#6FA14A',
  accentMuted: 'rgba(159, 211, 107, 0.15)',

  // Semantic
  green: '#6FA14A',
  greenMuted: 'rgba(111, 161, 74, 0.14)',
  orange: '#F2A93B',
  orangeMuted: 'rgba(242, 169, 59, 0.14)',
  red: '#C65A4B',
  redMuted: 'rgba(198, 90, 75, 0.14)',
  blue: '#6EA8B9',
  blueMuted: 'rgba(110, 168, 185, 0.14)',

  // Text
  text: '#F4F1E8',
  textSecondary: '#C9C2B4',
  muted: '#A79A87',
  dim: '#756A5C',

  // Gradients (as arrays for LinearGradient)
  gradientAccent: ['#A6D972', '#6FA14A'] as const,
  gradientGreen: ['#8AB85A', '#557A35'] as const,
  gradientOrange: ['#F2A93B', '#C97B1D'] as const,
  gradientDark: ['#231B14', '#120F0D'] as const,
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
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

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
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  md: {
    shadowColor: '#6FA14A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  lg: {
    shadowColor: '#F2A93B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
} as const;

// Responsive helpers
export const MOBILE_MAX_WIDTH = 430;
export const TABLET_BREAKPOINT = 768;
