import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { locales } from "@/i18n/config";
import { localizedPath } from "@/lib/seo/metadata";

/** Public, indexable paths (without locale). Product pages will be added from the database. */
const staticPaths = ["/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteConfig.url}${localizedPath(locale, path)}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteConfig.url}${localizedPath(l, path)}`]),
        ),
      },
    })),
  );
}
