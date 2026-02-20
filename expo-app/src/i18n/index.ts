import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, type LanguageCode } from '../constants/languages';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enTranslations from './en.json';
import ruTranslations from './ru.json';
import deTranslations from './de.json';
import esTranslations from './es.json';
import frTranslations from './fr.json';
import itTranslations from './it.json';
import ptTranslations from './pt.json';
import trTranslations from './tr.json';
import faTranslations from './fa.json';
import zhTranslations from './zh.json';
import jaTranslations from './ja.json';
import koTranslations from './ko.json';
import ukTranslations from './uk.json';
import plTranslations from './pl.json';

const resources = {
  en: { translation: enTranslations },
  ru: { translation: ruTranslations },
  de: { translation: deTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations },
  it: { translation: itTranslations },
  pt: { translation: ptTranslations },
  tr: { translation: trTranslations },
  fa: { translation: faTranslations },
  zh: { translation: zhTranslations },
  ja: { translation: jaTranslations },
  ko: { translation: koTranslations },
  uk: { translation: ukTranslations },
  pl: { translation: plTranslations },
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
