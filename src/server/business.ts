import "server-only";

import { cache } from "react";

import { businessDefaults } from "@/config/business-defaults";
import { isSupabaseConfigured } from "@/config/env";
import { defaultLocale, type AppLocale } from "@/i18n/config";
import { pickTranslation } from "@/lib/i18n/content";
import { siteMediaUrl } from "@/lib/site-media";
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
  /** Minimum years in business, displayed as "N+ years". */
  experienceYears: number;
  tagline: string | null;
  about: string | null;
  locationDescription: string | null;
  /** Photo of the shop uploaded in the admin dashboard, or null. */
  shopPhoto: { url: string; width: number | null; height: number | null } | null;
  phones: BusinessContact[];
  whatsapp: BusinessContact[];
  otherContacts: BusinessContact[];
  hours: OpeningInterval[];
  /** "database" when loaded from Supabase, "defaults" when using verified fallbacks. */
  source: "database" | "defaults";
};

function toContacts(type: "phone" | "whatsapp", values: readonly string[]): BusinessContact[] {
  return values.map((value, i) => ({
    id: `default-${type}-${i}`,
    type,
    value,
    label: null,
    is_primary: i === 0,
  }));
}

/** Verified fallback used when the database is not available. */
function getDefaultBusinessInfo(locale: AppLocale): BusinessInfo {
  const d = businessDefaults;
  return {
    name: d.name,
    countryCode: d.countryCode,
    city: d.city,
    address: d.address,
    googleMapsUrl: null,
    latitude: null,
    longitude: null,
    timezone: d.timezone,
    experienceYears: d.experienceYears,
    tagline: null,
    about: null,
    locationDescription: d.locationDescription[locale] ?? d.locationDescription[defaultLocale],
    shopPhoto: null,
    phones: toContacts("phone", d.phones),
    whatsapp: toContacts("whatsapp", d.whatsapp),
    otherContacts: [],
    hours: [1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => ({
      dayOfWeek,
      opensAt: d.dailyHours.opensAt,
      closesAt: d.dailyHours.closesAt,
      isClosed: false,
    })),
    source: "defaults",
  };
}

/**
 * Public business information for the given language.
 *
 * Reads Supabase; if it is not configured, unreachable or empty, returns the
 * verified defaults so contact details are always correct. Deduplicated per
 * request with React `cache`.
 */
export const getBusinessInfo = cache(async (locale: AppLocale): Promise<BusinessInfo> => {
  if (!isSupabaseConfigured) return getDefaultBusinessInfo(locale);

  try {
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
    if (error) throw new Error(error.message);
    if (!settings.data) return getDefaultBusinessInfo(locale);

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
      // Column added in a later migration; tolerate databases that lack it.
      experienceYears: s.experience_years ?? businessDefaults.experienceYears,
      tagline: t?.tagline ?? null,
      about: t?.about ?? null,
      locationDescription: t?.location_description ?? null,
      // Columns added in a later migration; tolerate databases that lack them.
      shopPhoto: s.shop_photo_path
        ? {
            url: siteMediaUrl(s.shop_photo_path),
            width: s.shop_photo_width ?? null,
            height: s.shop_photo_height ?? null,
          }
        : null,
      phones: allContacts.filter((c) => c.type === "phone"),
      whatsapp: allContacts.filter((c) => c.type === "whatsapp"),
      otherContacts: allContacts.filter((c) => c.type !== "phone" && c.type !== "whatsapp"),
      hours: (hours.data ?? []).map((h) => ({
        dayOfWeek: h.day_of_week,
        opensAt: h.opens_at,
        closesAt: h.closes_at,
        isClosed: h.is_closed,
      })),
      source: "database",
    };
  } catch (error) {
    console.error(
      "[business] Falling back to verified defaults:",
      error instanceof Error ? error.message : error,
    );
    return getDefaultBusinessInfo(locale);
  }
});

/** The primary contact of a type (the one marked primary, else the first). */
export function primaryContact(contacts: BusinessContact[]): BusinessContact | undefined {
  return contacts.find((c) => c.is_primary) ?? contacts[0];
}
