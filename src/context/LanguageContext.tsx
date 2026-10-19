import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { parsePath, pathFor, type Page } from '../lib/route';
import { SITE } from '../content/apply';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  page: Page;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function savedLanguage(): Language | null {
  try {
    const saved = localStorage.getItem('ibma_language');
    return saved === 'ar' || saved === 'fr' || saved === 'en' ? saved : null;
  } catch {
    return null;
  }
}

function initialState() {
  const route = parsePath(window.location.pathname);
  // A visitor who previously chose English/French and opens the Arabic address gets their language back.
  if (!route.explicit) {
    const saved = savedLanguage();
    if (saved && saved !== 'ar') {
      try { window.history.replaceState(null, '', pathFor(saved, route.page) + window.location.hash); } catch { /* ignore */ }
      return { lang: saved, page: route.page };
    }
  }
  return { lang: route.lang, page: route.page };
}

function setMeta(selector: string, value: string) {
  document.querySelector(selector)?.setAttribute('content', value);
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialState);
  const language = state.lang;
  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    try { localStorage.setItem('ibma_language', language); } catch { /* Browsers may block storage. */ }
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    const privacyTitle = { ar: 'سياسة الخصوصية', en: 'Privacy Policy', fr: 'Politique de confidentialité' }[language];
    document.title = state.page === 'privacy' ? `${privacyTitle} | IBMA Accounting Ltd` : SITE.seo.title[language];
    setMeta('meta[name="description"]', SITE.seo.description[language]);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', new URL(pathFor(language, state.page), window.location.origin).toString());
  }, [language, dir, state.page]);

  useEffect(() => {
    const onPop = () => {
      const r = parsePath(window.location.pathname);
      setState({ lang: r.lang, page: r.page });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (lang === state.lang) return;
    try { window.history.pushState(null, '', pathFor(lang, state.page) + window.location.hash); } catch { /* ignore */ }
    setState({ lang, page: state.page });
  }, [state]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, page: state.page }}>
      <div dir={dir} className="w-full min-h-screen">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
