"use server";

import { locales } from "@/i18n/config";
import {
  LOCATION_PHOTO_PATH_PATTERN,
  SHOP_PHOTO_PATH_PATTERN,
  SITE_MEDIA_BUCKET,
} from "@/lib/site-media";

import { ok, type FormState } from "./form";
import { assertNoDbError, runAdminAction } from "./guard";
import { text, uuid, ValidationError } from "./validation";

/** Owners and managers manage business-wide settings (matches the RLS policies). */
const SITE_ROLES = ["owner", "manager"] as const;

/**
 * Records the shop photo the browser has just uploaded to the site-media
 * bucket, and removes the previous file.
 */
export async function setShopPhotoAction(input: {
  storagePath: string;
  width: number;
  height: number;
}): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const { storagePath, width, height } = input;
    if (!SHOP_PHOTO_PATH_PATTERN.test(storagePath)) throw new ValidationError("errors.generic");

    const { data: current } = await supabase
      .from("business_settings")
      .select("shop_photo_path")
      .eq("id", 1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("business_settings")
      .update({
        shop_photo_path: storagePath,
        shop_photo_width: Number.isInteger(width) && width > 0 ? width : null,
        shop_photo_height: Number.isInteger(height) && height > 0 ? height : null,
      })
      .eq("id", 1)
      .select("id");
    assertNoDbError(error);
    if (!data?.length) throw new ValidationError("errors.notAuthorized");

    const old = current?.shop_photo_path;
    if (old && old !== storagePath) {
      await supabase.storage.from(SITE_MEDIA_BUCKET).remove([old]);
    }
    return ok("shopPhoto.saved");
  }, SITE_ROLES);
}

/** Removes the shop photo; the home page shows the drawing again. */
export async function removeShopPhotoAction(): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const { data: current } = await supabase
      .from("business_settings")
      .select("shop_photo_path")
      .eq("id", 1)
      .maybeSingle();

    const { error } = await supabase
      .from("business_settings")
      .update({ shop_photo_path: null, shop_photo_width: null, shop_photo_height: null })
      .eq("id", 1);
    assertNoDbError(error);

    if (current?.shop_photo_path) {
      await supabase.storage.from(SITE_MEDIA_BUCKET).remove([current.shop_photo_path]);
    }
    return ok("shopPhoto.removed");
  }, SITE_ROLES);
}

/** Undoes an upload whose database update failed. */
export async function discardShopPhotoUploadAction(storagePath: string): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    if (!SHOP_PHOTO_PATH_PATTERN.test(storagePath)) return;
    const { data } = await supabase
      .from("business_settings")
      .select("shop_photo_path")
      .eq("id", 1)
      .maybeSingle();
    if (data?.shop_photo_path !== storagePath) {
      await supabase.storage.from(SITE_MEDIA_BUCKET).remove([storagePath]);
    }
  }, SITE_ROLES);
}

// ---------------------------------------------------------------------------
// Location photos ("How to find us")
// ---------------------------------------------------------------------------

/** Records a location photo the browser has just uploaded to site-media. */
export async function addLocationPhotoAction(input: {
  storagePath: string;
  width: number;
  height: number;
}): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const { storagePath, width, height } = input;
    if (!LOCATION_PHOTO_PATH_PATTERN.test(storagePath)) throw new ValidationError("errors.generic");

    const { data: last } = await supabase
      .from("location_photos")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("location_photos").insert({
      storage_path: storagePath,
      width: Number.isInteger(width) && width > 0 ? width : null,
      height: Number.isInteger(height) && height > 0 ? height : null,
      display_order: (last?.display_order ?? 0) + 10,
    });
    assertNoDbError(error);
  }, SITE_ROLES);
}

/** Saves the caption of one photo in every language (empty = no caption). */
export async function saveLocationPhotoCaptionsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return runAdminAction(async ({ supabase }) => {
    const id = uuid(formData, "id");
    for (const locale of locales) {
      const caption = text(formData, `caption_${locale}`, 200);
      const result = caption
        ? await supabase
            .from("location_photo_translations")
            .upsert({ photo_id: id, locale, caption })
        : await supabase
            .from("location_photo_translations")
            .delete()
            .eq("photo_id", id)
            .eq("locale", locale);
      assertNoDbError(result.error);
    }
  }, SITE_ROLES);
}

export async function moveLocationPhotoAction(formData: FormData): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    const id = uuid(formData, "id");
    const direction = formData.get("direction") === "up" ? -1 : 1;
    const { data, error } = await supabase
      .from("location_photos")
      .select("id")
      .order("display_order")
      .order("created_at");
    assertNoDbError(error);

    const ids = (data ?? []).map((p) => p.id);
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];

    for (const [i, photoId] of ids.entries()) {
      assertNoDbError(
        (
          await supabase
            .from("location_photos")
            .update({ display_order: (i + 1) * 10 })
            .eq("id", photoId)
        ).error,
      );
    }
  }, SITE_ROLES);
}

export async function deleteLocationPhotoAction(formData: FormData): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    const id = uuid(formData, "id");
    const { data, error } = await supabase
      .from("location_photos")
      .delete()
      .eq("id", id)
      .select("storage_path");
    assertNoDbError(error);
    const paths = (data ?? []).map((p) => p.storage_path);
    if (paths.length) await supabase.storage.from(SITE_MEDIA_BUCKET).remove(paths);
  }, SITE_ROLES);
}

/** Undoes an upload whose database record failed. */
export async function discardLocationPhotoUploadAction(storagePath: string): Promise<void> {
  await runAdminAction(async ({ supabase }) => {
    if (!LOCATION_PHOTO_PATH_PATTERN.test(storagePath)) return;
    const { count } = await supabase
      .from("location_photos")
      .select("id", { count: "exact", head: true })
      .eq("storage_path", storagePath);
    if (!count) await supabase.storage.from(SITE_MEDIA_BUCKET).remove([storagePath]);
  }, SITE_ROLES);
}
