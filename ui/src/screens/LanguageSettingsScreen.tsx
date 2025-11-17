import { useTranslation } from 'react-i18next';

interface LanguageSettingsScreenProps {
  onBack: () => void;
}

type Language = 'en' | 'ru';

export function LanguageSettingsScreen({ onBack }: LanguageSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as Language;

  const languages: Array<{
    code: Language;
    name: string;
  }> = [
    { code: 'ru', name: t('settings.general.language_ru') },
    { code: 'en', name: t('settings.general.language_en') },
  ];

  const handleLanguageChange = (language: Language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('netok.lang', language);
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
      <div className="flex-1 overflow-auto px-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-[28px]">{t('settings.general.language')}</h1>

        {/* Language Options */}
        <div className="space-y-2">
          {languages.map((language) => {
            const isSelected = currentLanguage === language.code;
            return (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="w-full h-[44px] rounded-[12px] px-4 flex items-center justify-between focus:outline-none hover:bg-background-hover transition-colors bg-background-tertiary"
              >
                <span className="text-base font-medium text-foreground leading-5">{language.name}</span>

                {/* Checkmark */}
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-primary flex-shrink-0"
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
