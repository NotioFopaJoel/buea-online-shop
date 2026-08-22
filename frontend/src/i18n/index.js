import en from './en';
import fr from './fr';

/**
 * Central translation registry. Adding a new language later means adding
 * one file (e.g. es.js) and one line here - no other code needs to change.
 */
export const translations = { en, fr };

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
];

export const DEFAULT_LANGUAGE = 'en';

/**
 * Resolves a dot-path key (e.g. "checkout.placeOrder") against the given
 * language's dictionary, falling back to English, then to the key itself
 * so the UI never renders a blank string.
 */
export function translate(lang, key) {
  const dict = translations[lang] || translations[DEFAULT_LANGUAGE];
  const fallbackDict = translations[DEFAULT_LANGUAGE];

  const resolve = (source) => key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);

  return resolve(dict) ?? resolve(fallbackDict) ?? key;
}
