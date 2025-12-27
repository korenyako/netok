import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider - Handles DOM side effects for theme changes.
 *
 * This component is responsible for:
 * 1. Applying the theme class to the document element
 * 2. Syncing resolved theme on mount
 *
 * The store itself is pure (no DOM manipulation), and this component
 * bridges the gap between React state and DOM updates.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, resolvedTheme, updateResolvedTheme } = useThemeStore();

  // Initialize resolved theme on mount
  useEffect(() => {
    updateResolvedTheme();
  }, [updateResolvedTheme]);

  // Apply theme class to document when resolved theme changes
  useEffect(() => {
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Re-resolve theme when user preference changes
  useEffect(() => {
    updateResolvedTheme();
  }, [theme, updateResolvedTheme]);

  return <>{children}</>;
}
