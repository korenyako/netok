import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../stores/themeStore';
import type { Theme } from '../stores/themeStore';

interface ThemeSettingsScreenProps {
  onBack: () => void;
}

export function ThemeSettingsScreen({ onBack }: ThemeSettingsScreenProps) {
  const { t } = useTranslation();
  const { theme: currentTheme, setTheme } = useThemeStore();

  const themes: Array<{
    id: Theme;
    title: string;
    description: string;
  }> = [
    {
      id: 'light',
      title: t('settings.general.theme_light'),
      description: t('settings.general.theme_light_desc'),
    },
    {
      id: 'dark',
      title: t('settings.general.theme_dark'),
      description: t('settings.general.theme_dark_desc'),
    },
    {
      id: 'system',
      title: t('settings.general.theme_system'),
      description: t('settings.general.theme_system_desc'),
    },
  ];

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  const getThemeIcon = (themeId: Theme) => {
    if (themeId === 'light') {
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <g clipPath="url(#clip0_180_480)">
            <path d="M8.00004 1.33325V2.66659M8.00004 13.3333V14.6666M3.2867 3.28658L4.2267 4.22658M11.7734 11.7733L12.7134 12.7133M1.33337 7.99992H2.66671M13.3334 7.99992H14.6667M4.2267 11.7733L3.2867 12.7133M12.7134 3.28658L11.7734 4.22658M10.6667 7.99992C10.6667 9.47268 9.4728 10.6666 8.00004 10.6666C6.52728 10.6666 5.33337 9.47268 5.33337 7.99992C5.33337 6.52716 6.52728 5.33325 8.00004 5.33325C9.4728 5.33325 10.6667 6.52716 10.6667 7.99992Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <defs>
            <clipPath id="clip0_180_480">
              <rect width="16" height="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      );
    } else if (themeId === 'dark') {
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M13.9901 8.32394C13.9276 9.48137 13.5312 10.5959 12.8488 11.5329C12.1664 12.4698 11.2272 13.1891 10.1447 13.6036C9.0623 14.0182 7.88294 14.1104 6.74924 13.869C5.61554 13.6276 4.57603 13.063 3.75636 12.2434C2.9367 11.4238 2.37198 10.3844 2.13047 9.25068C1.88895 8.117 1.98099 6.93764 2.39544 5.85515C2.8099 4.77266 3.52903 3.8334 4.46591 3.1509C5.40279 2.4684 6.5173 2.07188 7.67472 2.00927C7.94472 1.99461 8.08606 2.31594 7.94272 2.54461C7.46332 3.31164 7.25804 4.21852 7.36039 5.11724C7.46274 6.01596 7.86667 6.85346 8.50627 7.49306C9.14587 8.13266 9.98337 8.53659 10.8821 8.63894C11.7808 8.74129 12.6877 8.53601 13.4547 8.05661C13.6841 7.91327 14.0047 8.05394 13.9901 8.32394Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M5.33337 14H10.6667M8.00004 11.3333V14M2.66671 2H13.3334C14.0698 2 14.6667 2.59695 14.6667 3.33333V10C14.6667 10.7364 14.0698 11.3333 13.3334 11.3333H2.66671C1.93033 11.3333 1.33337 10.7364 1.33337 10V3.33333C1.33337 2.59695 1.93033 2 2.66671 2Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button */}
      <div className="px-4 py-4">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg
            className="w-6 h-6 text-gray-500"
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
      <div className="flex-1 overflow-auto px-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-[28px]">{t('settings.general.theme')}</h1>

        {/* Theme Options */}
        <div className="space-y-4">
          {themes.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className="w-full rounded-[12px] flex flex-col items-start focus:outline-none hover:bg-background-hover transition-colors bg-background-tertiary"
              >
                {/* Header with Icon, Title and Checkmark */}
                <div className="flex items-center gap-3 w-full px-4 pt-3">
                  {/* Icon */}
                  <div className="w-4 h-4 flex-shrink-0 text-foreground">
                    {getThemeIcon(theme.id)}
                  </div>

                  {/* Title */}
                  <span className="text-base font-medium text-foreground flex-1 text-left leading-5">
                    {theme.title}
                  </span>

                  {/* Checkmark */}
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-[#3CB57F] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 16 16"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8l3 3 7-7" />
                    </svg>
                  )}
                </div>

                {/* Description */}
                <div className="text-sm text-foreground-secondary text-left leading-[19.6px] px-4 pt-2 pb-4">
                  {theme.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
