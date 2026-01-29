import { useThemeStore } from "@/stores/themeStore"

/**
 * Hook that provides the resolved theme for components that need
 * to know the current effective theme ('light' or 'dark').
 *
 * Reads from the existing Zustand themeStore which handles
 * system preference detection and persistence.
 */
export function useTheme() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)

  return { resolvedTheme }
}
