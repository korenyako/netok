import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './i18n/en.json';
import ruTranslations from './i18n/ru.json';

const resources = {
  en: { translation: enTranslations },
  ru: { translation: ruTranslations }
};

// Read saved language from localStorage
const savedLang = localStorage.getItem('netok.lang') || 'ru';

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

export default i18next;
