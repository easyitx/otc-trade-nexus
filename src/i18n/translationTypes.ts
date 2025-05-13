import { enTranslations } from "./translations";

export type Locale = "en" | "ru";
export type Translation = typeof enTranslations;

// Add the missing translation keys
export type TranslationKey = keyof typeof enTranslations | 'validationError' | 'error';
