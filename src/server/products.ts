import "server-only";

import { cache } from "react";

import { isSupabaseConfigured, publicEnv } from "@/config/env";
import { defaultLocale, type AppLocale } from "@/i18n/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export const PRODUCT_IMAGES_BUCKET = "product-images";

export type ProductAvailability = "in_stock" | "low_stock" | "out_of_stock" | "on_request";

export type ProductVariantSummary = {
  id: string;
  label: string | null;
  sizeValue: number | null;
  sizeUnit: string | null;
  /** null means "price on request" — never display it as 0. */
  price: number | null;
  currency: string;
  isAvailable: boolean;
};

export type ProductImage = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

/** Everything a product card needs. Reused by the home page and the future Products page. */
export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  isFeatured: boolean;
  availability: ProductAvailability;
  /** The default (or first) variant; drives the size and price shown on cards. */
  primaryVariant: ProductVariantSummary | null;
  variantCount: number;
  image: ProductImage | null;
};

/** Public URL of an object in the product-images bucket. */
export function productImageUrl(storagePath: string): string {
  const path = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}`;
}

function pickLocale<T extends { locale: string }>(rows: T[] | null | undefined, locale: AppLocale) {
  const list = rows ?? [];
  return (
    list.find((r) => r.locale === locale) ??
    list.find((r) => r.locale === defaultLocale) ??
    list[0] ??
    null
  );
}

const SUMMARY_SELECT = `
  id, slug, is_featured, availability, display_order,
  product_translations ( locale, name, short_description ),
  product_variants ( id, label, size_value, size_unit, price, currency, is_available, is_default, display_order ),
  product_images ( storage_path, width, height, is_primary, display_order,
    product_image_translations ( locale, alt_text ) )
`;

type SummaryRow = {
  id: string;
  slug: string;
  is_featured: boolean;
  availability: string;
  product_translations: { locale: string; name: string; short_description: string | null }[];
  product_variants: {
    id: string;
    label: string | null;
    size_value: number | null;
    size_unit: string | null;
    price: number | null;
    currency: string;
    is_available: boolean;
    is_default: boolean;
    display_order: number;
  }[];
  product_images: {
    storage_path: string;
    width: number | null;
    height: number | null;
    is_primary: boolean;
    display_order: number;
    product_image_translations: { locale: string; alt_text: string }[];
  }[];
};

function toSummary(row: SummaryRow, locale: AppLocale): ProductSummary | null {
  const t = pickLocale(row.product_translations, locale);
  // A product without any name is not ready to be shown.
  if (!t) return null;

  const variants = [...row.product_variants].sort((a, b) => a.display_order - b.display_order);
  const variant = variants.find((v) => v.is_default) ?? variants[0] ?? null;

  const images = [...row.product_images].sort((a, b) => a.display_order - b.display_order);
  const image = images.find((i) => i.is_primary) ?? images[0] ?? null;

  return {
    id: row.id,
    slug: row.slug,
    name: t.name,
    shortDescription: t.short_description,
    isFeatured: row.is_featured,
    availability: row.availability as ProductAvailability,
    primaryVariant: variant && {
      id: variant.id,
      label: variant.label,
      sizeValue: variant.size_value,
      sizeUnit: variant.size_unit,
      price: variant.price,
      currency: variant.currency,
      isAvailable: variant.is_available,
    },
    variantCount: variants.length,
    image: image && {
      url: productImageUrl(image.storage_path),
      // Alt text from the database; the product name is a meaningful fallback.
      alt: pickLocale(image.product_image_translations, locale)?.alt_text ?? t.name,
      width: image.width,
      height: image.height,
    },
  };
}

/**
 * Featured published products for the home page. If none are marked as
 * featured, the first published products are shown instead. Returns an empty
 * list when there are no products or the database is unavailable.
 */
export const getFeaturedProducts = cache(
  async (locale: AppLocale, limit = 6): Promise<ProductSummary[]> => {
    if (!isSupabaseConfigured) return [];

    try {
      const supabase = createSupabasePublicClient();
      const query = () =>
        supabase
          .from("products")
          .select(SUMMARY_SELECT)
          .eq("status", "published")
          .order("display_order")
          .order("created_at")
          .limit(limit);

      const featured = await query().eq("is_featured", true).returns<SummaryRow[]>();
      if (featured.error) throw new Error(featured.error.message);

      let rows = featured.data ?? [];
      if (rows.length === 0) {
        const published = await query().returns<SummaryRow[]>();
        if (published.error) throw new Error(published.error.message);
        rows = published.data ?? [];
      }

      return rows.map((row) => toSummary(row, locale)).filter((p) => p !== null);
    } catch (error) {
      console.error(
        "[products] Failed to load featured products:",
        error instanceof Error ? error.message : error,
      );
      return [];
    }
  },
);
