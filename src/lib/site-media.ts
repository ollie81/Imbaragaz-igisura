import { publicEnv } from "@/config/env";

/** Public bucket for the logo, shop photo and other site pictures (see the storage migration). */
export const SITE_MEDIA_BUCKET = "site-media";

/** Shop photo path inside the bucket; the database check constraint uses the same pattern. */
export const SHOP_PHOTO_PATH_PATTERN = /^shop\/[0-9a-f-]{36}\.(webp|jpg)$/;

/** Public URL of an object in the site-media bucket. */
export function siteMediaUrl(storagePath: string): string {
  const path = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/${SITE_MEDIA_BUCKET}/${path}`;
}
