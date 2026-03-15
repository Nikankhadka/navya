import { Platform } from 'react-native';

export const Colors = {
  // Base
  bg: '#0A0A0F',
  surface: '#12121A',
  card: '#1A1A26',
  cardHover: '#1F1F30',
  border: '#2A2A3A',
  borderLight: '#353548',

  // Accent
  accent: '#7C5CFC',
  accentSoft: '#4F3AA8',
  accentMuted: 'rgba(124, 92, 252, 0.15)',

  // Semantic
  green: '#2FE5A3',
  greenMuted: 'rgba(47, 229, 163, 0.12)',
  orange: '#FF7A3D',
  orangeMuted: 'rgba(255, 122, 61, 0.12)',
  red: '#FF4D6D',
  redMuted: 'rgba(255, 77, 109, 0.12)',
  blue: '#4DA6FF',
  blueMuted: 'rgba(77, 166, 255, 0.12)',

  // Text
  text: '#F0F0FF',
  textSecondary: '#B8B8D0',
  muted: '#8888AA',
  dim: '#555570',

  // Gradients (as arrays for LinearGradient)
  gradientAccent: ['#7C5CFC', '#4F3AA8'] as const,
  gradientGreen: ['#2FE5A3', '#1AB87E'] as const,
  gradientOrange: ['#FF7A3D', '#E5562A'] as const,
  gradientDark: ['#1A1A26', '#12121A'] as const,
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

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// Responsive helpers
export const MOBILE_MAX_WIDTH = 430;
export const TABLET_BREAKPOINT = 768;
