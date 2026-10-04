import { siteConfig } from "@/config/site";
import type { AppLocale } from "@/i18n/config";
import { localizedPath } from "@/lib/seo/metadata";
import { formatTime } from "@/lib/utils/hours";
import type { BusinessInfo } from "@/server/business";

const SCHEMA_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/**
 * schema.org LocalBusiness built ONLY from database values — nothing is
 * added that the business has not confirmed.
 */
export function localBusinessJsonLd(business: BusinessInfo, locale: AppLocale) {
  const url = `${siteConfig.url}${localizedPath(locale, "/")}`;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: business.name,
    url,
    description: business.tagline ?? undefined,
    telephone: business.phones[0]?.value,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address ?? undefined,
      addressLocality: business.city ?? undefined,
      addressCountry: business.countryCode,
    },
    geo:
      business.latitude != null && business.longitude != null
        ? { "@type": "GeoCoordinates", latitude: business.latitude, longitude: business.longitude }
        : undefined,
    hasMap: business.googleMapsUrl ?? undefined,
    openingHoursSpecification: business.hours
      .filter((h) => !h.isClosed && h.opensAt && h.closesAt)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${SCHEMA_DAYS[h.dayOfWeek - 1]}`,
        opens: formatTime(h.opensAt!),
        closes: formatTime(h.closesAt!),
      })),
  };
}
