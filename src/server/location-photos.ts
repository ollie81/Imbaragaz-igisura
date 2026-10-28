import "server-only";

import { cache } from "react";

import { isSupabaseConfigured } from "@/config/env";
import type { AppLocale } from "@/i18n/config";
import { pickTranslation } from "@/lib/i18n/content";
import { siteMediaUrl } from "@/lib/site-media";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LocationPhoto = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  /** Caption in the requested language (falls back to another language). */
  caption: string | null;
};

export type AdminLocationPhoto = Omit<LocationPhoto, "caption"> & {
  captions: Partial<Record<string, string>>;
};

const SELECT = "id, storage_path, width, height, location_photo_translations ( locale, caption )";

/** Photos that show how to find the shop, in display order. Empty on any error. */
export const getLocationPhotos = cache(async (locale: AppLocale): Promise<LocationPhoto[]> => {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await createSupabasePublicClient()
      .from("location_photos")
      .select(SELECT)
      .order("display_order")
      .order("created_at");
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      id: p.id,
      url: siteMediaUrl(p.storage_path),
      width: p.width,
      height: p.height,
      caption: pickTranslation(p.location_photo_translations ?? [], locale)?.caption ?? null,
    }));
  } catch (error) {
    // The table arrives in a later migration; the site works without it.
    console.error("[location-photos]", error instanceof Error ? error.message : error);
    return [];
  }
});

/** Admin view with captions in every language. */
export async function listAdminLocationPhotos(): Promise<AdminLocationPhoto[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("location_photos")
    .select(SELECT)
    .order("display_order")
    .order("created_at");
  if (error) {
    console.error("[location-photos] admin:", error.message);
    return [];
  }
  return (data ?? []).map((p) => ({
    id: p.id,
    url: siteMediaUrl(p.storage_path),
    width: p.width,
    height: p.height,
    captions: Object.fromEntries(
      (p.location_photo_translations ?? []).map((t) => [t.locale, t.caption]),
    ),
  }));
}
