import "server-only";

import { cache } from "react";

import { isSupabaseConfigured } from "@/config/env";
import { defaultLocale, type AppLocale } from "@/i18n/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { OpeningInterval } from "@/lib/utils/hours";
import type { Tables } from "@/types/database";

export type BusinessContact = Pick<
  Tables<"business_contacts">,
  "id" | "type" | "value" | "label" | "is_primary"
>;

export type BusinessInfo = {
  name: string;
  countryCode: string;
  city: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  tagline: string | null;
  about: string | null;
  locationDescription: string | null;
  phones: BusinessContact[];
  whatsapp: BusinessContact[];
  otherContacts: BusinessContact[];
  hours: OpeningInterval[];
};

/** Picks the requested language, falling back to the default, then to any. */
function pickTranslation<T extends { locale: string }>(rows: T[], locale: AppLocale): T | null {
  return (
    rows.find((r) => r.locale === locale) ??
    rows.find((r) => r.locale === defaultLocale) ??
    rows[0] ??
    null
  );
}

/**
 * Public business information for the given language.
 *
 * Returns null when Supabase is not configured or unreachable, so the public
 * site degrades gracefully (it renders without contact details) instead of
 * failing. Deduplicated per request with React `cache`.
 */
export const getBusinessInfo = cache(async (locale: AppLocale): Promise<BusinessInfo | null> => {
  if (!isSupabaseConfigured) return null;

  const supabase = createSupabasePublicClient();
  const [settings, translations, contacts, hours] = await Promise.all([
    supabase.from("business_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("business_settings_translations")
      .select("locale, tagline, about, location_description"),
    supabase
      .from("business_contacts")
      .select("id, type, value, label, is_primary")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("business_hours")
      .select("day_of_week, opens_at, closes_at, is_closed")
      .order("day_of_week")
      .order("opens_at"),
  ]);

  const error = settings.error ?? translations.error ?? contacts.error ?? hours.error;
  if (error) {
    console.error("[business] Failed to load business information:", error.message);
    return null;
  }
  if (!settings.data) return null;

  const s = settings.data;
  const t = pickTranslation(translations.data ?? [], locale);
  const allContacts = contacts.data ?? [];

  return {
    name: s.business_name,
    countryCode: s.country_code,
    city: s.city,
    address: s.address,
    googleMapsUrl: s.google_maps_url,
    latitude: s.latitude,
    longitude: s.longitude,
    timezone: s.timezone,
    tagline: t?.tagline ?? null,
    about: t?.about ?? null,
    locationDescription: t?.location_description ?? null,
    phones: allContacts.filter((c) => c.type === "phone"),
    whatsapp: allContacts.filter((c) => c.type === "whatsapp"),
    otherContacts: allContacts.filter((c) => c.type !== "phone" && c.type !== "whatsapp"),
    hours: (hours.data ?? []).map((h) => ({
      dayOfWeek: h.day_of_week,
      opensAt: h.opens_at,
      closesAt: h.closes_at,
      isClosed: h.is_closed,
    })),
  };
});
