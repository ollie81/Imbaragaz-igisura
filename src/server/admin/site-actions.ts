"use server";

import { SHOP_PHOTO_PATH_PATTERN, SITE_MEDIA_BUCKET } from "@/lib/site-media";

import { ok, type FormState } from "./form";
import { assertNoDbError, runAdminAction } from "./guard";
import { ValidationError } from "./validation";

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
