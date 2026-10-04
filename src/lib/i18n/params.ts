import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import type { AppLocale } from "@/i18n/config";
import { routing } from "@/i18n/routing";

export type LocaleParams = { params: Promise<{ locale: string }> };

/**
 * Validates the [locale] route param, enables static rendering for it and
 * returns it typed. Unknown locales render the 404 page.
 */
export async function resolveLocale(params: LocaleParams["params"]): Promise<AppLocale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}
