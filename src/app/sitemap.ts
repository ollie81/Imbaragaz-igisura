import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { locales } from "@/i18n/config";
import { localizedPath } from "@/lib/seo/metadata";
import { productPath } from "@/lib/utils/product-paths";
import { getPublishedProductSlugs } from "@/server/products";

// Refreshed hourly so newly published products are listed.
export const revalidate = 3600;

/** Public, indexable paths (without locale). */
const staticPaths = ["/", "/products", "/about"];

function entry(path: string, lastModified?: string): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${siteConfig.url}${localizedPath(locale, path)}`,
    lastModified,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${siteConfig.url}${localizedPath(l, path)}`]),
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProductSlugs();
  return [
    ...staticPaths.flatMap((path) => entry(path)),
    ...products.flatMap((p) => entry(productPath(p.slug), p.updatedAt)),
  ];
}
