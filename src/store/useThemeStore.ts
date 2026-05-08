import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { ThemeModePreference } from '@/theme/themes';

const THEME_PREFERENCE_KEY = 'navya.theme.preference';

interface ThemeState {
  preference: ThemeModePreference;
  isHydrated: boolean;
  hydratePreference: () => Promise<void>;
  setPreference: (preference: ThemeModePreference) => Promise<void>;
}

let themeHydrationPromise: Promise<void> | null = null;

function isThemeModePreference(value: string | null): value is ThemeModePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  isHydrated: false,

  hydratePreference: async () => {
    if (get().isHydrated) {
      return;
    }

    if (themeHydrationPromise) {
      await themeHydrationPromise;
      return;
    }

    themeHydrationPromise = (async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);

        if (isThemeModePreference(storedPreference)) {
          set({ preference: storedPreference });
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        set({ isHydrated: true });
        themeHydrationPromise = null;
      }
    })();

    await themeHydrationPromise;
  },

  setPreference: async (preference) => {
    set({ preference });

    try {
      if (preference === 'system') {
        await AsyncStorage.removeItem(THEME_PREFERENCE_KEY);
      } else {
        await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
      }
    } catch (error) {
      console.error('Failed to persist theme preference:', error);
    }
  },
}));
