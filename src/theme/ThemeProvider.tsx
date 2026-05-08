import { createContext, useContext, useEffect, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { themes, type ThemeColors, type ThemeModePreference, type ThemeName } from './themes';
import { useThemeStore } from '@/store/useThemeStore';

interface AppThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  isHydrated: boolean;
  preference: ThemeModePreference;
  resolvedTheme: ThemeName;
  setPreference: (preference: ThemeModePreference) => Promise<void>;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);
  const isHydrated = useThemeStore((state) => state.isHydrated);
  const hydratePreference = useThemeStore((state) => state.hydratePreference);
  const setPreference = useThemeStore((state) => state.setPreference);

  useEffect(() => {
    void hydratePreference();
  }, [hydratePreference]);

  const resolvedTheme: ThemeName =
    preference === 'system' ? (systemTheme === 'light' ? 'light' : 'dark') : preference;

  return (
    <AppThemeContext.Provider
      value={{
        colors: themes[resolvedTheme],
        isDark: resolvedTheme === 'dark',
        isHydrated,
        preference,
        resolvedTheme,
        setPreference,
      }}
    >
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider.');
  }

  return context;
}
