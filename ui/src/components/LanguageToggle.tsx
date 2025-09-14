import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('netok.lang', lang);
  };

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleLanguageChange('ru')}
        className={`h-8 px-3 text-[13px] border rounded ${
          i18n.language === 'ru' 
            ? 'bg-neutral-600 text-white border-neutral-600' 
            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`h-8 px-3 text-[13px] border rounded ${
          i18n.language === 'en' 
            ? 'bg-neutral-600 text-white border-neutral-600' 
            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
        }`}
      >
        EN
      </button>
    </div>
  );
}
