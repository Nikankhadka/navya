import { createTamagui } from 'tamagui';
import { themes } from './src/theme/themes';
import { tokens } from './src/theme/tokens';

export const config = createTamagui({
  tokens,
  themes,
  defaultTheme: 'dark',
  shorthands: {
    p: 'padding',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    pt: 'paddingTop',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    pr: 'paddingRight',
    m: 'margin',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    mt: 'marginTop',
    mb: 'marginBottom',
    ml: 'marginLeft',
    mr: 'marginRight',
    bg: 'backgroundColor',
    br: 'borderRadius',
  },
});

export const tamaguiConfig = config;
export type AppTamaguiConfig = typeof config;
export default config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
