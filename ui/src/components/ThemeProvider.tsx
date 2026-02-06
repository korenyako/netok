import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../stores/themeStore';
import { LANGUAGES, type LanguageCode } from '../constants/languages';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider - Handles DOM side effects for theme and language direction.
 *
 * Applies the theme class and dir/lang attributes to the document element.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useThemeStore((state) => state.theme);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const updateDirection = (lang: string) => {
      const meta = LANGUAGES[lang as LanguageCode];
      document.documentElement.dir = meta?.dir || 'ltr';
      document.documentElement.lang = lang;
    };

    updateDirection(i18n.language);
    i18n.on('languageChanged', updateDirection);
    return () => { i18n.off('languageChanged', updateDirection); };
  }, [i18n]);

  return <>{children}</>;
}
