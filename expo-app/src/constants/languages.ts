export const LANGUAGES = {
  en: { native: 'English', dir: 'ltr' },
  ru: { native: 'Русский', dir: 'ltr' },
  de: { native: 'Deutsch', dir: 'ltr' },
  es: { native: 'Español', dir: 'ltr' },
  fr: { native: 'Français', dir: 'ltr' },
  it: { native: 'Italiano', dir: 'ltr' },
  pt: { native: 'Português', dir: 'ltr' },
  tr: { native: 'Türkçe', dir: 'ltr' },
  fa: { native: 'فارسی', dir: 'rtl' },
  zh: { native: '中文', dir: 'ltr' },
  ja: { native: '日本語', dir: 'ltr' },
  ko: { native: '한국어', dir: 'ltr' },
  uk: { native: 'Українська', dir: 'ltr' },
  pl: { native: 'Polski', dir: 'ltr' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;
