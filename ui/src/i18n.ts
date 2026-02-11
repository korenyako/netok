import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, type LanguageCode } from './constants/languages';
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

const supportedCodes = Object.keys(LANGUAGES) as LanguageCode[];

/** Resolve navigator.language to one of our supported language codes */
export function resolveSystemLanguage(): LanguageCode {
  const browserLang = navigator.language; // e.g. "ru-RU", "en-US", "zh-CN"
  const base = browserLang.split('-')[0].toLowerCase();
  if (supportedCodes.includes(base as LanguageCode)) {
    return base as LanguageCode;
  }
  return 'en';
}

/** Get the display string for the system language, e.g. "Русский (Россия)" */
export function getSystemLanguageDisplay(): string {
  const browserLang = navigator.language;
  const resolved = resolveSystemLanguage();
  const nativeName = LANGUAGES[resolved].native;
  // Try to get region from Intl.DisplayNames
  try {
    const parts = browserLang.split('-');
    if (parts.length > 1) {
      const regionCode = parts[1].toUpperCase();
      const displayNames = new Intl.DisplayNames([browserLang], { type: 'region' });
      const regionName = displayNames.of(regionCode);
      if (regionName) {
        return `${nativeName} (${regionName})`;
      }
    }
  } catch {
    // fallback
  }
  return nativeName;
}

// Read saved language from localStorage
const savedLang = localStorage.getItem('netok.lang') || 'system';
const resolvedLang = savedLang === 'system' ? resolveSystemLanguage() : savedLang;

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: resolvedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

export default i18next;
