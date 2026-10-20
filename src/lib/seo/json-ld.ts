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
 * schema.org LocalBusiness built ONLY from confirmed business data. No
 * ratings, reviews, prices, coordinates or social profiles are added unless
 * they exist in the database.
 */
export function localBusinessJsonLd(
  business: BusinessInfo,
  locale: AppLocale,
  options: { description?: string } = {},
) {
  const url = `${siteConfig.url}${localizedPath(locale, "/")}`;
  const open = business.hours.filter((h) => !h.isClosed && h.opensAt && h.closesAt);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: business.name,
    url,
    inLanguage: locale,
    description: business.tagline ?? options.description,
    image: business.shopPhoto?.url,
    telephone: business.phones[0]?.value,
    contactPoint: business.phones.map((p) => ({
      "@type": "ContactPoint",
      telephone: p.value,
      contactType: "customer service",
    })),
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
    openingHoursSpecification: open.length
      ? open.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${SCHEMA_DAYS[h.dayOfWeek - 1]}`,
          opens: formatTime(h.opensAt!),
          closes: formatTime(h.closesAt!),
        }))
      : undefined,
  };
}
