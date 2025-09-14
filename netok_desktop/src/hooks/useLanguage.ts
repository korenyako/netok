import { useState, useEffect } from 'react';
import i18next from '../i18n';

export function useLanguage() {
  const [lang, setLangState] = useState<string>('ru');

  useEffect(() => {
    // Read saved language from localStorage on mount
    const savedLang = localStorage.getItem('netok.lang') || 'ru';
    setLangState(savedLang);
    i18next.changeLanguage(savedLang);
  }, []);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    i18next.changeLanguage(newLang);
    localStorage.setItem('netok.lang', newLang);
  };

  return { lang, setLang };
}
