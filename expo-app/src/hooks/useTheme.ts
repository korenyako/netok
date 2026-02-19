import { useThemeStore, type Theme } from '../stores/themeStore';
import { colors, type ThemeColors } from '../theme/colors';

interface UseThemeReturn {
  theme: Theme;
  themeColors: ThemeColors;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export function useTheme(): UseThemeReturn {
  const { theme, setTheme } = useThemeStore();
  return {
    theme,
    themeColors: colors[theme],
    setTheme,
    isDark: theme === 'dark',
  };
}
