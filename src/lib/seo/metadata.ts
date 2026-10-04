import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { defaultLocale, localeMeta, locales, type AppLocale } from "@/i18n/config";

/** Builds a locale-prefixed path: ("en", "/products") → "/en/products". */
export function localizedPath(locale: AppLocale, path: string): string {
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean}`;
}

/** Canonical URL + hreflang alternates for a path that exists in every language. */
export function buildAlternates(locale: AppLocale, path: string): Metadata["alternates"] {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localizedPath(l, path)])),
      "x-default": localizedPath(defaultLocale, path),
    },
  };
}

type PageMetadataInput = {
  locale: AppLocale;
  /** Path without the locale prefix, e.g. "/" or "/products/olive-oil" */
  path: string;
  title?: string;
  description?: string;
  siteName?: string;
  images?: { url: string; width?: number; height?: number; alt: string }[];
};

/** Consistent metadata (canonical, hreflang, Open Graph, Twitter) for public pages. */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  siteName = siteConfig.fallbackName,
  images,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: "website",
      siteName,
      title: title ?? siteName,
      description,
      url: localizedPath(locale, path),
      locale: localeMeta[locale].openGraphLocale,
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => localeMeta[l].openGraphLocale),
      images,
    },
    twitter: {
      card: images?.length ? "summary_large_image" : "summary",
      title: title ?? siteName,
      description,
    },
  };
}
