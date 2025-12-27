import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  updateResolvedTheme: () => void;
}

// Helper to get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper to resolve theme based on user preference
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      resolvedTheme: 'light',

      // Pure state update - no DOM side effects
      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        set({ theme, resolvedTheme: resolved });
      },

      // Pure state update - no DOM side effects
      updateResolvedTheme: () => {
        const { theme } = get();
        const resolved = resolveTheme(theme);
        set({ resolvedTheme: resolved });
      },
    }),
    {
      name: 'theme-storage',
      // Only persist the user's theme choice, not the resolved theme
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Listen to system theme changes (pure state update)
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      store.updateResolvedTheme();
    }
  });
}
