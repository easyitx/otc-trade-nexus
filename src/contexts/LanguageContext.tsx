
import { createContext, useContext, useState, ReactNode } from "react";
import { enTranslations, ruTranslations } from "../i18n/translations";
import { Locale, TranslationKey } from "../i18n/translationTypes";

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create a translations object with both languages
const translations = {
  en: enTranslations,
  ru: ruTranslations
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Changed default language to Russian
  const [language, setLanguage] = useState<Locale>('ru');

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
