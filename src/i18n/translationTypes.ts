
import { enTranslations } from "./translations";

export type Locale = "en" | "ru";
export type Translation = typeof enTranslations;

// Make sure that all translation keys are included in the type
export type TranslationKey = keyof typeof enTranslations;
