import "server-only";

import { cache } from "react";

import { isSupabaseConfigured } from "@/config/env";
import type { AppLocale } from "@/i18n/config";
import { pickTranslation } from "@/lib/i18n/content";
import { productImageUrl } from "@/lib/products/images";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export { PRODUCT_IMAGES_BUCKET, productImageUrl } from "@/lib/products/images";

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

export type ProductCategoryRef = { slug: string; name: string };

/** Everything a product card needs. Used on the home page and the Products page. */
export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  isFeatured: boolean;
  /** null = the business has not stated availability; show nothing. */
  availability: ProductAvailability | null;
  category: ProductCategoryRef | null;
  /** The default (or first) variant; drives the size and price shown on cards. */
  primaryVariant: ProductVariantSummary | null;
  variantCount: number;
  image: ProductImage | null;
};

/** Full product information for the detail page. Optional fields are null when unknown. */
export type ProductDetail = ProductSummary & {
  /** Language the text is actually shown in (falls back when not translated yet). */
  contentLocale: string;
  description: string | null;
  origin: string | null;
  ingredients: string | null;
  traditionalUse: string | null;
  usageInstructions: string | null;
  warnings: string | null;
  storageInstructions: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  variants: ProductVariantSummary[];
  images: ProductImage[];
  updatedAt: string;
};

export type CatalogCategory = ProductCategoryRef & { productCount: number };

export type ProductListResult = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export const PRODUCTS_PAGE_SIZE = 24;
const MAX_QUERY_LENGTH = 80;

// ---------------------------------------------------------------------------
// Row shapes returned by PostgREST
// ---------------------------------------------------------------------------

type TranslationRow = {
  locale: string;
  name: string;
  short_description: string | null;
};

type VariantRow = {
  id: string;
  label: string | null;
  size_value: number | null;
  size_unit: string | null;
  price: number | null;
  currency: string;
  is_available: boolean;
  is_default: boolean;
  display_order: number;
};

type ImageRow = {
  storage_path: string;
  width: number | null;
  height: number | null;
  is_primary: boolean;
  display_order: number;
  product_image_translations: { locale: string; alt_text: string }[];
};

type CategoryRow = {
  slug: string;
  is_active: boolean;
  product_category_translations: { locale: string; name: string }[];
} | null;

type SummaryRow = {
  id: string;
  slug: string;
  is_featured: boolean;
  availability: string | null;
  product_translations: TranslationRow[];
  product_variants: VariantRow[];
  product_images: ImageRow[];
  product_categories: CategoryRow;
};

type DetailRow = Omit<SummaryRow, "product_translations"> & {
  updated_at: string;
  product_translations: (TranslationRow & {
    description: string | null;
    origin: string | null;
    ingredients: string | null;
    traditional_use: string | null;
    usage_instructions: string | null;
    warnings: string | null;
    storage_instructions: string | null;
    seo_title: string | null;
    seo_description: string | null;
  })[];
};

const SUMMARY_SELECT = `
  id, slug, is_featured, availability, display_order,
  product_translations ( locale, name, short_description ),
  product_variants ( id, label, size_value, size_unit, price, currency, is_available, is_default, display_order ),
  product_images ( storage_path, width, height, is_primary, display_order,
    product_image_translations ( locale, alt_text ) ),
  product_categories ( slug, is_active, product_category_translations ( locale, name ) )
`;

const DETAIL_SELECT = `
  id, slug, is_featured, availability, display_order, updated_at,
  product_translations ( locale, name, short_description, description, origin, ingredients,
    traditional_use, usage_instructions, warnings, storage_instructions, seo_title, seo_description ),
  product_variants ( id, label, size_value, size_unit, price, currency, is_available, is_default, display_order ),
  product_images ( storage_path, width, height, is_primary, display_order,
    product_image_translations ( locale, alt_text ) ),
  product_categories ( slug, is_active, product_category_translations ( locale, name ) )
`;

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

const byOrder = <T extends { display_order: number }>(rows: T[]) =>
  [...rows].sort((a, b) => a.display_order - b.display_order);

function toVariant(v: VariantRow): ProductVariantSummary {
  return {
    id: v.id,
    label: v.label,
    sizeValue: v.size_value,
    sizeUnit: v.size_unit,
    price: v.price,
    currency: v.currency,
    isAvailable: v.is_available,
  };
}

function toImage(image: ImageRow, locale: AppLocale, fallbackAlt: string): ProductImage {
  return {
    url: productImageUrl(image.storage_path),
    // Alt text from the database; the product name is a meaningful fallback.
    alt: pickTranslation(image.product_image_translations, locale)?.alt_text ?? fallbackAlt,
    width: image.width,
    height: image.height,
  };
}

function toCategory(row: CategoryRow, locale: AppLocale): ProductCategoryRef | null {
  if (!row || !row.is_active) return null;
  const t = pickTranslation(row.product_category_translations, locale);
  return t ? { slug: row.slug, name: t.name } : null;
}

function toSummary(row: SummaryRow, locale: AppLocale): ProductSummary | null {
  const t = pickTranslation(row.product_translations, locale);
  // A product without any name is not ready to be shown.
  if (!t) return null;

  const variants = byOrder(row.product_variants);
  const variant = variants.find((v) => v.is_default) ?? variants[0] ?? null;
  const images = byOrder(row.product_images);
  const image = images.find((i) => i.is_primary) ?? images[0] ?? null;

  return {
    id: row.id,
    slug: row.slug,
    name: t.name,
    shortDescription: t.short_description,
    isFeatured: row.is_featured,
    availability: row.availability as ProductAvailability | null,
    category: toCategory(row.product_categories, locale),
    primaryVariant: variant && toVariant(variant),
    variantCount: variants.length,
    image: image && toImage(image, locale, t.name),
  };
}

function logError(scope: string, error: unknown) {
  console.error(`[products] ${scope}:`, error instanceof Error ? error.message : error);
}

/** Escapes LIKE wildcards so a customer's search text is matched literally. */
function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export function normalizeSearchQuery(raw: string | undefined): string {
  return (raw ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

// ---------------------------------------------------------------------------
// Queries (public, cookie-less client: Row Level Security only exposes
// published products and active categories)
// ---------------------------------------------------------------------------

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
      logError("featured", error);
      return [];
    }
  },
);

/**
 * Active categories that contain at least one published product, with counts,
 * in the order chosen by the business.
 */
export const getCatalogCategories = cache(async (locale: AppLocale): Promise<CatalogCategory[]> => {
  if (!isSupabaseConfigured) return [];

  const supabase = createSupabasePublicClient();
  const [categories, products] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, slug, display_order, product_category_translations ( locale, name )")
      .eq("is_active", true)
      .order("display_order"),
    supabase.from("products").select("category_id").eq("status", "published"),
  ]);
  const error = categories.error ?? products.error;
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const p of products.data ?? []) {
    if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }

  return (categories.data ?? []).flatMap((c) => {
    const t = pickTranslation(c.product_category_translations, locale);
    const productCount = counts.get(c.id) ?? 0;
    return t && productCount > 0 ? [{ slug: c.slug, name: t.name, productCount }] : [];
  });
});

type ListOptions = {
  locale: AppLocale;
  query?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
};

/**
 * Published products, paginated, optionally filtered by category and by a
 * search term matched against names and short descriptions in ALL languages
 * (and category names), so "Tangawizi" and "Ginger" both find ginger.
 *
 * Throws on database errors so the page can show its error state.
 */
export async function listPublishedProducts({
  locale,
  query,
  categorySlug,
  page = 1,
  pageSize = PRODUCTS_PAGE_SIZE,
}: ListOptions): Promise<ProductListResult> {
  const empty = { items: [], total: 0, page: 1, pageCount: 0, pageSize };
  if (!isSupabaseConfigured) return empty;

  const supabase = createSupabasePublicClient();
  const q = normalizeSearchQuery(query);

  let categoryId: string | null = null;
  if (categorySlug) {
    const { data, error } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return empty;
    categoryId = data.id;
  }

  let matchingIds: string[] | null = null;
  if (q) {
    const pattern = likePattern(q);
    const [byName, byDescription, byCategory] = await Promise.all([
      supabase.from("product_translations").select("product_id").ilike("name", pattern),
      supabase
        .from("product_translations")
        .select("product_id")
        .ilike("short_description", pattern),
      supabase.from("product_category_translations").select("category_id").ilike("name", pattern),
    ]);
    const error = byName.error ?? byDescription.error ?? byCategory.error;
    if (error) throw new Error(error.message);

    const ids = new Set([
      ...(byName.data ?? []).map((r) => r.product_id),
      ...(byDescription.data ?? []).map((r) => r.product_id),
    ]);
    const categoryIds = [...new Set((byCategory.data ?? []).map((r) => r.category_id))];
    if (categoryIds.length > 0) {
      const inCategories = await supabase
        .from("products")
        .select("id")
        .eq("status", "published")
        .in("category_id", categoryIds);
      if (inCategories.error) throw new Error(inCategories.error.message);
      for (const r of inCategories.data ?? []) ids.add(r.id);
    }
    matchingIds = [...ids];
    if (matchingIds.length === 0) return empty;
  }

  const safePage = Math.max(1, Math.floor(page));
  const from = (safePage - 1) * pageSize;

  let request = supabase
    .from("products")
    .select(SUMMARY_SELECT, { count: "exact" })
    .eq("status", "published");
  if (categoryId) request = request.eq("category_id", categoryId);
  if (matchingIds) request = request.in("id", matchingIds);

  const { data, error, count } = await request
    .order("is_featured", { ascending: false })
    .order("display_order")
    .order("created_at")
    .range(from, from + pageSize - 1)
    .returns<SummaryRow[]>();
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    items: (data ?? []).map((row) => toSummary(row, locale)).filter((p) => p !== null),
    total,
    page: safePage,
    pageCount: Math.ceil(total / pageSize),
    pageSize,
  };
}

/**
 * A published product by slug, or null if it does not exist or is not
 * published (drafts are invisible to the public through RLS).
 */
export const getPublishedProduct = cache(
  async (locale: AppLocale, slug: string): Promise<ProductDetail | null> => {
    if (!isSupabaseConfigured || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;

    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(DETAIL_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle<DetailRow>();
    if (error) throw new Error(error.message);
    if (!data) return null;

    const summary = toSummary(data, locale);
    const t = pickTranslation(data.product_translations, locale);
    if (!summary || !t) return null;

    return {
      ...summary,
      contentLocale: t.locale,
      description: t.description,
      origin: t.origin,
      ingredients: t.ingredients,
      traditionalUse: t.traditional_use,
      usageInstructions: t.usage_instructions,
      warnings: t.warnings,
      storageInstructions: t.storage_instructions,
      seoTitle: t.seo_title,
      seoDescription: t.seo_description,
      variants: byOrder(data.product_variants).map(toVariant),
      images: byOrder(data.product_images)
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
        .map((image) => toImage(image, locale, t.name)),
      updatedAt: data.updated_at,
    };
  },
);

/** Slugs and update times of all published products (for the sitemap). */
export async function getPublishedProductSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await createSupabasePublicClient()
      .from("products")
      .select("slug, updated_at")
      .eq("status", "published");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
  } catch (error) {
    logError("slugs", error);
    return [];
  }
}
