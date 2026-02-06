import { useThemeStore } from "@/stores/themeStore"

/**
 * Hook that provides the current theme ('light' or 'dark').
 */
export function useTheme() {
  const theme = useThemeStore((state) => state.theme)

  return { theme }
}
