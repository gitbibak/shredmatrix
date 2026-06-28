import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

const SUPPORTED = ['tr', 'en', 'es'];
const STORAGE_KEY = 'shredmatrix_lang';

function detectLanguage() {
  // 1. Check saved preference
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch {}

  // 2. Browser/device language preferences
  const browserLanguages = [
    ...(navigator.languages || []),
    navigator.language,
    navigator.userLanguage,
  ].filter(Boolean);

  for (const candidate of browserLanguages) {
    const language = candidate.slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(language)) return language;
  }

  // 3. Fallback
  return 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((newLang) => {
    if (SUPPORTED.includes(newLang)) {
      setLangState(newLang);
      try { localStorage.setItem(STORAGE_KEY, newLang); } catch {}
    }
  }, []);

  const t = useCallback((key, replacements) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    // Fallback to Turkish, then key
    if (value === undefined) {
      value = translations.tr;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
    }
    if (value === undefined) return key;

    // Replace {{placeholder}} patterns
    if (replacements && typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => replacements[k] ?? `{{${k}}}`);
    }
    return value;
  }, [lang]);

  const ctx = useMemo(() => ({
    lang, setLang, t, SUPPORTED,
    langLabels: { tr: 'Türkçe', en: 'English', es: 'Español' },
    langFlags: { tr: '🇹🇷', en: '🇬🇧', es: '🇪🇸' },
  }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={ctx}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be inside LanguageProvider');
  return ctx;
}
