import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locale JSON files synchronously
import ruCommon from './locales/ru/common.json';
import enCommon from './locales/en/common.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      ru: { common: ruCommon },
      en: { common: enCommon },
    },
    lng: 'ru',           // temp default; later read saved user setting
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

export default i18next;
