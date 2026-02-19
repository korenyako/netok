import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, type LanguageCode } from '../constants/languages';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enTranslations from './en.json';
import ruTranslations from './ru.json';

const resources = {
  en: { translation: enTranslations },
  ru: { translation: ruTranslations },
};

const supportedCodes = Object.keys(LANGUAGES) as LanguageCode[];

export function resolveSystemLanguage(): LanguageCode {
  // On mobile, we'll default to 'en' initially.
  // The actual locale detection happens after async init.
  return 'en';
}

// Initialize synchronously with English, then load saved preference
i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

// Async: load saved language preference
AsyncStorage.getItem('netok.lang').then((savedLang) => {
  if (savedLang && savedLang !== 'system') {
    if (supportedCodes.includes(savedLang as LanguageCode)) {
      i18next.changeLanguage(savedLang);
    }
  }
});

export default i18next;
