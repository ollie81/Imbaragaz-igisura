import { defineRouting } from "next-intl/routing";

import { defaultLocale, locales } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every URL carries its language (/rw/…, /en/…): clear for customers,
  // unambiguous for search engines (hreflang) and stable for printed QR codes.
  localePrefix: "always",
});
