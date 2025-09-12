// Default language
let currentLanguage = "ru";

// Translation storage
let translations: Record<string, string> = {};

// Load translations from JSON file
async function loadTranslations(lang: string): Promise<void> {
  try {
    const response = await fetch(`/src/i18n/${lang}.json`);
    if (response.ok) {
      translations = await response.json();
    } else {
      console.warn(`Failed to load translations for ${lang}`);
    }
  } catch (error) {
    console.warn(`Error loading translations for ${lang}:`, error);
  }
}

// Initialize with default language
loadTranslations(currentLanguage);

// Translation function
export function t(key: string): string {
  return translations[key] || `[MISSING] ${key}`;
}

// Set language function
export function setLanguage(lang: string): void {
  currentLanguage = lang;
  loadTranslations(lang);
}

// Get current language
export function getCurrentLanguage(): string {
  return currentLanguage;
}
