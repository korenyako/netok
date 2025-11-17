import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../stores/themeStore';

interface SettingsScreenProps {
  onNavigateToTheme: () => void;
  onNavigateToLanguage: () => void;
  onBack?: () => void;
}

export function SettingsScreen({ onNavigateToTheme, onNavigateToLanguage, onBack }: SettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const appVersion = '1.0.0';

  const { theme: currentTheme } = useThemeStore();
  const currentLanguage = i18n.language;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button */}
      <div className="px-4 py-4">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg
            className="w-6 h-6 text-foreground-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-[28px]">{t('settings.title')}</h1>

        {/* Settings Cards */}
        <div className="space-y-4">
          {/* Theme Setting Card */}
          <button
            onClick={onNavigateToTheme}
            className="w-full bg-background-tertiary rounded-xl p-4 flex flex-col items-start focus:outline-none hover:opacity-80 transition-opacity"
          >
            <span className="text-base font-medium text-foreground leading-5 mb-2">{t('settings.general.theme')}</span>
            <span className="text-sm text-foreground-secondary leading-[19.6px]">
              {currentTheme === 'light' && t('settings.general.theme_light')}
              {currentTheme === 'dark' && t('settings.general.theme_dark')}
              {currentTheme === 'system' && t('settings.general.theme_system')}
            </span>
          </button>

          {/* Language Setting Card */}
          <button
            onClick={onNavigateToLanguage}
            className="w-full bg-background-tertiary rounded-xl p-4 flex flex-col items-start focus:outline-none hover:opacity-80 transition-opacity"
          >
            <span className="text-base font-medium text-foreground leading-5 mb-2">{t('settings.general.language')}</span>
            <span className="text-sm text-foreground-secondary leading-[19.6px]">
              {currentLanguage === 'ru' ? t('settings.general.language_ru') : t('settings.general.language_en')}
            </span>
          </button>
        </div>

        {/* Version */}
        <div className="mt-auto pb-4 flex items-center justify-center">
          <span className="text-xs text-foreground-tertiary">v{appVersion}</span>
        </div>
      </div>
    </div>
  );
}
