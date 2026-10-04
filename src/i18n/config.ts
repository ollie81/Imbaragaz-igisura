/**
 * Single source of truth for supported languages.
 *
 * To add a language (e.g. Swahili):
 *   1. add its code to `locales` and an entry to `localeMeta`
 *   2. create `src/messages/<code>.json` with the same keys as `en.json`
 *   3. insert it into the `public.locales` table so content can be translated
 */
export const locales = ["rw", "en"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "rw";

export const localeMeta: Record<AppLocale, { nativeName: string; openGraphLocale: string }> = {
  rw: { nativeName: "Ikinyarwanda", openGraphLocale: "rw_RW" },
  en: { nativeName: "English", openGraphLocale: "en_US" },
};
