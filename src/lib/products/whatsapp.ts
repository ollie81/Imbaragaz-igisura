import { siteConfig } from "@/config/site";
import type { AppLocale } from "@/i18n/config";
import { localizedPath } from "@/lib/seo/metadata";
import { whatsappHref } from "@/lib/utils/phone";
import { productPath } from "@/lib/utils/product-paths";

/** Absolute, shareable URL of a product page in a given language. */
export function productUrl(locale: AppLocale, slug: string): string {
  return `${siteConfig.url}${localizedPath(locale, productPath(slug))}`;
}

/**
 * WhatsApp link that opens a chat with the business, pre-filled with the
 * product name and its web address so the business knows what is meant.
 */
export function productWhatsappHref(e164: string, message: string): string {
  return whatsappHref(e164, message);
}
