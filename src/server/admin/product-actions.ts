"use server";

import { redirect } from "next/navigation";

import { defaultLocale, locales, type AppLocale } from "@/i18n/config";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/products/images";
import type { TablesInsert, TablesUpdate } from "@/types/database";

import type { FormState } from "./form";
import { assertNoDbError, runAdminAction } from "./guard";
import {
  checkbox,
  decimal,
  integer,
  optionalUuid,
  slug,
  slugify,
  text,
  uuid,
  ValidationError,
  UUID_PATTERN,
} from "./validation";

const STATUSES = ["draft", "published", "archived"] as const;
const AVAILABILITY = ["in_stock", "low_stock", "out_of_stock", "on_request"] as const;
const UNITS = ["ml", "l", "g", "kg", "piece", "pack"] as const;
const LANGUAGE_NAMES: Record<AppLocale, string> = { rw: "Kinyarwanda", en: "English" };

/** Translatable product fields → max length. Field names are `${field}_${locale}` in forms. */
const TRANSLATION_FIELDS = {
  name: 200,
  short_description: 300,
  description: 5000,
  origin: 300,
  ingredients: 2000,
  traditional_use: 3000,
  usage_instructions: 3000,
  warnings: 3000,
  storage_instructions: 1000,
  seo_title: 70,
  seo_description: 170,
} as const;

function readLocaleParam(formData: FormData): AppLocale {
  const value = formData.get("locale");
  return (locales as readonly string[]).includes(String(value))
    ? (value as AppLocale)
    : defaultLocale;
}

function oneOf<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[],
): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

/** Reads every language's fields; returns rows to upsert and locales to delete. */
function readTranslations(formData: FormData) {
  const upserts: Omit<TablesInsert<"product_translations">, "product_id">[] = [];
  const removals: AppLocale[] = [];

  for (const locale of locales) {
    const values = Object.fromEntries(
      Object.entries(TRANSLATION_FIELDS).map(([field, max]) => [
        field,
        text(formData, `${field}_${locale}`, max),
      ]),
    ) as Record<keyof typeof TRANSLATION_FIELDS, string | null>;
    const hasAnything = Object.values(values).some(Boolean);

    if (values.name) {
      upserts.push({ locale, ...values, name: values.name });
    } else if (hasAnything) {
      throw new ValidationError("errors.nameRequiredForLocale", `name_${locale}`, {
        language: LANGUAGE_NAMES[locale],
      });
    } else {
      removals.push(locale);
    }
  }
  if (upserts.length === 0)
    throw new ValidationError("errors.nameRequired", `name_${defaultLocale}`);
  return { upserts, removals };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function createProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = readLocaleParam(formData);
  let createdId: string | null = null;

  const result = await runAdminAction(async ({ admin, supabase }) => {
    const nameRw = text(formData, "name_rw", 200);
    const nameEn = text(formData, "name_en", 200);
    if (!nameRw && !nameEn) throw new ValidationError("errors.nameRequired", "name_rw");

    // A unique, readable web address from the English (or Kinyarwanda) name.
    const base = slugify(nameEn ?? nameRw ?? "") || "product";
    const { data: taken } = await supabase.from("products").select("slug").like("slug", `${base}%`);
    const used = new Set((taken ?? []).map((r) => r.slug));
    let candidate = base;
    for (let n = 2; used.has(candidate); n++) candidate = `${base}-${n}`;

    const { data, error } = await supabase
      .from("products")
      .insert({
        slug: candidate,
        category_id: optionalUuid(formData, "category_id"),
        status: "draft",
        availability: null,
        created_by: admin.userId,
        updated_by: admin.userId,
      })
      .select("id")
      .single();
    assertNoDbError(error, "name_rw");

    const rows = [
      nameRw && { product_id: data!.id, locale: "rw", name: nameRw },
      nameEn && { product_id: data!.id, locale: "en", name: nameEn },
    ].filter((r) => r !== null && r !== "");
    const { error: tError } = await supabase
      .from("product_translations")
      .insert(rows as TablesInsert<"product_translations">[]);
    if (tError) {
      // Do not leave a nameless product behind.
      await supabase.from("products").delete().eq("id", data!.id);
      assertNoDbError(tError);
    }
    createdId = data!.id;
  });

  if (createdId) redirect(`/${locale}/admin/products/${createdId}`);
  return result;
}

export async function updateProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return runAdminAction(async ({ admin, supabase }) => {
    const id = uuid(formData, "id");
    const status = oneOf(formData.get("status"), STATUSES);
    if (!status) throw new ValidationError("errors.generic");
    const { upserts, removals } = readTranslations(formData);

    const update: TablesUpdate<"products"> = {
      slug: slug(formData, "slug"),
      category_id: optionalUuid(formData, "category_id"),
      status,
      availability: oneOf(formData.get("availability"), AVAILABILITY),
      is_featured: checkbox(formData, "is_featured"),
      display_order: integer(formData, "display_order"),
      updated_by: admin.userId,
    };
    const { error, count } = await supabase
      .from("products")
      .update(update, { count: "exact" })
      .eq("id", id);
    assertNoDbError(error, "slug");
    if (count === 0) throw new ValidationError("errors.notFound");

    const { error: upsertError } = await supabase
      .from("product_translations")
      .upsert(upserts.map((row) => ({ ...row, product_id: id })));
    assertNoDbError(upsertError);
    if (removals.length) {
      const { error: deleteError } = await supabase
        .from("product_translations")
        .delete()
        .eq("product_id", id)
        .in("locale", removals);
      assertNoDbError(deleteError);
    }
  });
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const locale = readLocaleParam(formData);
  let deleted = false;

  await runAdminAction(async ({ supabase }) => {
    const id = uuid(formData, "id");
    const { data: images } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    assertNoDbError(error);
    // Rows are gone (cascade); now remove the files themselves.
    const paths = (images ?? []).map((i) => i.storage_path);
    if (paths.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
    deleted = true;
  });

  if (deleted) redirect(`/${locale}/admin/products`);
}

// ---------------------------------------------------------------------------
// Sizes / variants
// ---------------------------------------------------------------------------

export async function saveVariantAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const productId = uuid(formData, "product_id");
    const variantId = optionalUuid(formData, "id");
    const sizeValue = decimal(formData, "size_value", "errors.sizeInvalid");
    const sizeUnit = oneOf(formData.get("size_unit"), UNITS);
    if ((sizeValue === null) !== (sizeUnit === null)) {
      throw new ValidationError("errors.sizeUnitRequired", "size_value");
    }
    const isDefault = checkbox(formData, "is_default");
    const currency = (text(formData, "currency", 3) ?? "RWF").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new ValidationError("errors.generic", "currency");

    const row = {
      product_id: productId,
      label: text(formData, "label", 80),
      size_value: sizeValue,
      size_unit: sizeUnit,
      price: decimal(formData, "price", "errors.priceInvalid"),
      currency,
      is_available: checkbox(formData, "is_available"),
      is_default: isDefault,
      display_order: integer(formData, "display_order"),
    };

    // Only one main size per product (enforced by a unique index).
    if (isDefault) {
      let clear = supabase
        .from("product_variants")
        .update({ is_default: false })
        .eq("product_id", productId);
      if (variantId) clear = clear.neq("id", variantId);
      assertNoDbError((await clear).error);
    }

    const { error } = variantId
      ? await supabase.from("product_variants").update(row).eq("id", variantId)
      : await supabase.from("product_variants").insert(row);
    assertNoDbError(error);
    return { status: "success", message: "productForm.saved", at: Date.now() };
  });
}

export async function deleteVariantAction(formData: FormData): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", uuid(formData, "id"));
    assertNoDbError(error);
  });
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

/**
 * Records a photo that the browser has just uploaded to Storage. The path must
 * live in this product's folder; the file itself never passes through here.
 */
export async function registerProductImageAction(input: {
  productId: string;
  storagePath: string;
  width: number;
  height: number;
}): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const { productId, storagePath, width, height } = input;
    const validPath = new RegExp(`^${productId}/[0-9a-f-]{36}\\.(webp|jpg|jpeg|png|avif)$`).test(
      storagePath,
    );
    if (!UUID_PATTERN.test(productId) || !validPath) throw new ValidationError("errors.generic");

    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: storagePath,
      width: Number.isInteger(width) && width > 0 ? width : null,
      height: Number.isInteger(height) && height > 0 ? height : null,
      is_primary: (count ?? 0) === 0,
      display_order: count ?? 0,
    });
    assertNoDbError(error);
  });
}

export async function saveImageAltAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const imageId = uuid(formData, "id");
    for (const locale of locales) {
      const alt = text(formData, `alt_${locale}`, 300);
      const { error } = alt
        ? await supabase
            .from("product_image_translations")
            .upsert({ image_id: imageId, locale, alt_text: alt })
        : await supabase
            .from("product_image_translations")
            .delete()
            .eq("image_id", imageId)
            .eq("locale", locale);
      assertNoDbError(error);
    }
  });
}

export async function setPrimaryImageAction(formData: FormData): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    const imageId = uuid(formData, "id");
    const productId = uuid(formData, "product_id");
    // Clear first: a unique index allows only one main photo per product.
    assertNoDbError(
      (
        await supabase
          .from("product_images")
          .update({ is_primary: false })
          .eq("product_id", productId)
      ).error,
    );
    assertNoDbError(
      (
        await supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", imageId)
          .eq("product_id", productId)
      ).error,
    );
  });
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    const imageId = uuid(formData, "id");
    const { data: image, error } = await supabase
      .from("product_images")
      .select("product_id, storage_path, is_primary")
      .eq("id", imageId)
      .maybeSingle();
    assertNoDbError(error);
    if (!image) return;

    assertNoDbError((await supabase.from("product_images").delete().eq("id", imageId)).error);
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([image.storage_path]);

    // Keep a main photo when other photos remain.
    if (image.is_primary) {
      const { data: next } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", image.product_id)
        .order("display_order")
        .limit(1)
        .maybeSingle();
      if (next)
        await supabase.from("product_images").update({ is_primary: true }).eq("id", next.id);
    }
  });
}

/** Used by the uploader to undo an upload whose database record failed. */
export async function discardUploadedImageAction(storagePath: string): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.\w+$/.test(storagePath)) return;
    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("storage_path", storagePath);
    if (!count) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([storagePath]);
  });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

function readCategoryNames(formData: FormData) {
  const names = locales.flatMap((locale) => {
    const name = text(formData, `name_${locale}`, 100);
    return name ? [{ locale, name }] : [];
  });
  if (names.length === 0) throw new ValidationError("errors.nameRequired", `name_${defaultLocale}`);
  return names;
}

export async function createCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const names = readCategoryNames(formData);
    const english = names.find((n) => n.locale === "en")?.name;
    const categorySlug = slugify(english ?? names[0].name) || "category";

    const { data: last } = await supabase
      .from("product_categories")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("product_categories")
      .insert({ slug: categorySlug, display_order: (last?.display_order ?? 0) + 10 })
      .select("id")
      .single();
    assertNoDbError(error, `name_${defaultLocale}`);

    const { error: tError } = await supabase
      .from("product_category_translations")
      .insert(names.map((n) => ({ ...n, category_id: data!.id })));
    assertNoDbError(tError);
    return { status: "success", message: "productForm.saved", at: Date.now() };
  });
}

export async function updateCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const id = uuid(formData, "id");
    const names = readCategoryNames(formData);

    const { error } = await supabase
      .from("product_categories")
      .update({ slug: slug(formData, "slug"), is_active: checkbox(formData, "is_active") })
      .eq("id", id);
    assertNoDbError(error, "slug");

    const { error: upsertError } = await supabase
      .from("product_category_translations")
      .upsert(names.map((n) => ({ ...n, category_id: id })));
    assertNoDbError(upsertError);

    const kept = names.map((n) => n.locale);
    const missing = locales.filter((l) => !kept.includes(l));
    if (missing.length) {
      assertNoDbError(
        (
          await supabase
            .from("product_category_translations")
            .delete()
            .eq("category_id", id)
            .in("locale", missing)
        ).error,
      );
    }
  });
}

/** Moves a category one place up or down by renumbering all categories. */
export async function moveCategoryAction(formData: FormData): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    const id = uuid(formData, "id");
    const direction = formData.get("direction") === "up" ? -1 : 1;
    const { data, error } = await supabase
      .from("product_categories")
      .select("id")
      .order("display_order")
      .order("created_at");
    assertNoDbError(error);

    const ids = (data ?? []).map((c) => c.id);
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];

    for (const [i, categoryId] of ids.entries()) {
      assertNoDbError(
        (
          await supabase
            .from("product_categories")
            .update({ display_order: (i + 1) * 10 })
            .eq("id", categoryId)
        ).error,
      );
    }
  });
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    // Products in this category keep existing, without a category (ON DELETE SET NULL).
    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("id", uuid(formData, "id"));
    assertNoDbError(error);
  });
}
