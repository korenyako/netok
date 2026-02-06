import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './i18n/en.json';
import ruTranslations from './i18n/ru.json';
import deTranslations from './i18n/de.json';
import esTranslations from './i18n/es.json';
import frTranslations from './i18n/fr.json';
import itTranslations from './i18n/it.json';
import ptTranslations from './i18n/pt.json';
import trTranslations from './i18n/tr.json';
import faTranslations from './i18n/fa.json';
import zhTranslations from './i18n/zh.json';
import jaTranslations from './i18n/ja.json';
import koTranslations from './i18n/ko.json';
import ukTranslations from './i18n/uk.json';
import plTranslations from './i18n/pl.json';

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

// Read saved language from localStorage
const savedLang = localStorage.getItem('netok.lang') || 'ru';

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

export default i18next;
