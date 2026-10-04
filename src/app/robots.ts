import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { locales } from "@/i18n/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: locales.map((locale) => `/${locale}/admin`),
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
