import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, type LanguageCode } from './constants/languages';
import enTranslations from './i18n/en.json';
import ruTranslations from './i18n/ru.json';
import deTranslations from './i18n/de.json';
import esTranslations from './i18n/es.json';
import frTranslations from './i18n/fr.json';
import itTranslations from './i18n/it.json';
import ptBrTranslations from './i18n/pt-BR.json';
import ptPtTranslations from './i18n/pt-PT.json';
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
  'pt-BR': { translation: ptBrTranslations },
  'pt-PT': { translation: ptPtTranslations },
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
  const browserLang = navigator.language; // e.g. "ru-RU", "en-US", "pt-BR", "pt-PT"
  // Exact match first, so regional codes like "pt-BR"/"pt-PT" resolve directly.
  if (supportedCodes.includes(browserLang as LanguageCode)) {
    return browserLang as LanguageCode;
  }
  const base = browserLang.split('-')[0].toLowerCase();
  // Portuguese has no plain "pt" entry — split by region: "pt-BR" → Brazil, everything
  // else (plain "pt", pt-PT, pt-AO, …) → European Portuguese.
  if (base === 'pt') {
    return browserLang.toLowerCase() === 'pt-br' ? 'pt-BR' : 'pt-PT';
  }
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
let savedLang = localStorage.getItem('netok.lang') || 'system';
// Migrate legacy "pt" preference (Portuguese was split into pt-BR / pt-PT).
if (savedLang === 'pt') {
  savedLang = 'pt-BR';
  localStorage.setItem('netok.lang', savedLang);
}
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
