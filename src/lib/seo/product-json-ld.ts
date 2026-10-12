import { siteConfig } from "@/config/site";
import type { AppLocale } from "@/i18n/config";
import { localizedPath } from "@/lib/seo/metadata";
import { productUrl } from "@/lib/products/whatsapp";
import type { ProductAvailability, ProductDetail } from "@/server/products";

const AVAILABILITY: Partial<Record<ProductAvailability, string>> = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
};

/**
 * schema.org Product built only from stored data. Offers are included only
 * for confirmed prices; there are no ratings, reviews or health claims.
 */
export function productJsonLd(product: ProductDetail, locale: AppLocale, businessName: string) {
  const url = productUrl(locale, product.slug);
  const prices = product.variants.filter((v) => v.price != null);
  const currency = prices[0]?.currency;
  const availability = product.availability ? AVAILABILITY[product.availability] : undefined;
  const seller = {
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: businessName,
  };

  let offers: Record<string, unknown> | undefined;
  if (prices.length === 1) {
    offers = {
      "@type": "Offer",
      price: prices[0].price,
      priceCurrency: prices[0].currency,
      availability,
      url,
      seller,
    };
  } else if (prices.length > 1 && prices.every((p) => p.currency === currency)) {
    const values = prices.map((p) => p.price as number);
    offers = {
      "@type": "AggregateOffer",
      lowPrice: Math.min(...values),
      highPrice: Math.max(...values),
      priceCurrency: currency,
      offerCount: prices.length,
      availability,
      seller,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url,
    inLanguage: product.contentLocale,
    description: product.shortDescription ?? product.description ?? undefined,
    image: product.images.length ? product.images.map((i) => i.url) : undefined,
    category: product.category?.name,
    brand: { "@type": "Brand", name: businessName },
    offers,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], locale: AppLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${localizedPath(locale, item.path)}`,
    })),
  };
}
