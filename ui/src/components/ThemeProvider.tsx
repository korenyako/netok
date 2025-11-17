import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, updateResolvedTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    updateResolvedTheme();
  }, [updateResolvedTheme]);

  // Update theme when it changes
  useEffect(() => {
    updateResolvedTheme();
  }, [theme, updateResolvedTheme]);

  return <>{children}</>;
}
