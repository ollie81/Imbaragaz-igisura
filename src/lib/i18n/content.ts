import { defaultLocale } from "@/i18n/config";

/**
 * Picks the database translation for a language, falling back to the default
 * language (Kinyarwanda), then English, then whatever exists. Content may be
 * saved before every translation is written, so pages must never assume one.
 */
export function pickTranslation<T extends { locale: string }>(
  rows: T[] | null | undefined,
  locale: string,
): T | null {
  const list = rows ?? [];
  return (
    list.find((r) => r.locale === locale) ??
    list.find((r) => r.locale === defaultLocale) ??
    list.find((r) => r.locale === "en") ??
    list[0] ??
    null
  );
}
