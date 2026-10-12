import "server-only";

import type { AppLocale } from "@/i18n/config";
import { pickTranslation } from "@/lib/i18n/content";
import { productImageUrl } from "@/lib/products/images";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/*
 * Admin read models. These use the signed-in manager's session, so Row Level
 * Security returns drafts and inactive categories only to administrators.
 */

export type AdminCategory = {
  id: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  names: Partial<Record<string, string>>;
  label: string;
  productCount: number;
};

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string | null;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  availability: string | null;
  categoryLabel: string | null;
  imageUrl: string | null;
  imageCount: number;
  variantCount: number;
  updatedAt: string;
};

export type AdminProduct = Tables<"products"> & {
  translations: Partial<Record<string, Tables<"product_translations">>>;
  variants: Tables<"product_variants">[];
  images: (Tables<"product_images"> & {
    url: string;
    alts: Partial<Record<string, string>>;
  })[];
};

export async function listAdminCategories(locale: AppLocale): Promise<AdminCategory[]> {
  const supabase = await createSupabaseServerClient();
  const [categories, products] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, slug, is_active, display_order, product_category_translations ( locale, name )")
      .order("display_order")
      .order("created_at"),
    supabase.from("products").select("category_id"),
  ]);
  const error = categories.error ?? products.error;
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const p of products.data ?? []) {
    if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }

  return (categories.data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    isActive: c.is_active,
    displayOrder: c.display_order,
    names: Object.fromEntries(c.product_category_translations.map((t) => [t.locale, t.name])),
    label: pickTranslation(c.product_category_translations, locale)?.name ?? c.slug,
    productCount: counts.get(c.id) ?? 0,
  }));
}

export async function listAdminProducts(locale: AppLocale): Promise<AdminProductRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, status, is_featured, availability, updated_at, display_order,
       product_translations ( locale, name ),
       product_images ( storage_path, is_primary, display_order ),
       product_variants ( id ),
       product_categories ( slug, product_category_translations ( locale, name ) )`,
    )
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => {
    const images = [...p.product_images].sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
    );
    const category = p.product_categories;
    return {
      id: p.id,
      slug: p.slug,
      name: pickTranslation(p.product_translations, locale)?.name ?? null,
      status: p.status as AdminProductRow["status"],
      isFeatured: p.is_featured,
      availability: p.availability,
      categoryLabel: category
        ? (pickTranslation(category.product_category_translations, locale)?.name ?? category.slug)
        : null,
      imageUrl: images[0] ? productImageUrl(images[0].storage_path) : null,
      imageCount: images.length,
      variantCount: p.product_variants.length,
      updatedAt: p.updated_at,
    };
  });
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, product_translations ( * ), product_variants ( * ),
       product_images ( *, product_image_translations ( locale, alt_text ) )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const { product_translations, product_variants, product_images, ...product } = data;
  return {
    ...product,
    translations: Object.fromEntries(product_translations.map((t) => [t.locale, t])),
    variants: [...product_variants].sort(
      (a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at),
    ),
    images: [...product_images]
      .sort(
        (a, b) =>
          Number(b.is_primary) - Number(a.is_primary) ||
          a.display_order - b.display_order ||
          a.created_at.localeCompare(b.created_at),
      )
      .map(({ product_image_translations, ...image }) => ({
        ...image,
        url: productImageUrl(image.storage_path),
        alts: Object.fromEntries(product_image_translations.map((t) => [t.locale, t.alt_text])),
      })),
  };
}

export async function getDashboardStats() {
  const supabase = await createSupabaseServerClient();
  const [products, categories] = await Promise.all([
    supabase.from("products").select("status"),
    supabase.from("product_categories").select("id", { count: "exact", head: true }),
  ]);
  const error = products.error ?? categories.error;
  if (error) throw new Error(error.message);
  const rows = products.data ?? [];
  return {
    published: rows.filter((p) => p.status === "published").length,
    drafts: rows.filter((p) => p.status === "draft").length,
    categories: categories.count ?? 0,
  };
}
