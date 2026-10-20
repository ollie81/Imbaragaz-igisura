import type { AppLocale } from "@/i18n/config";

/**
 * VERIFIED business facts, exactly as provided by the business.
 *
 * The database (business_settings, business_contacts, business_hours) is the
 * source of truth and always takes precedence. These values are only used when
 * the database is not configured or unreachable, so customers arriving from a
 * QR code always see correct contact details. They mirror
 * supabase/migrations/20261004000500_initial_business_data.sql and
 * 20261005000100_business_experience.sql — keep them in sync, and never add
 * anything here that the business has not confirmed.
 */
export const businessDefaults = {
  name: "Imbaraga z'Igisura",
  countryCode: "RW",
  city: "Musanze",
  address: "Musanze, Muhoza, Kigombe",
  timezone: "Africa/Kigali",
  experienceYears: 20,
  phones: ["+250788220423", "+250783965104"],
  whatsapp: ["+250788220423", "+250783965104"],
  /** Every day (ISO 1–7), 06:00–22:00 */
  dailyHours: { opensAt: "06:00:00", closesAt: "22:00:00" },
  /** Map search for the bus station the shop is inside (no coordinates have been provided). */
  landmarkSearchQuery: "Musanze Bus Station, Musanze, Rwanda",
  locationDescription: {
    en: "Inside Musanze Bus Station: first floor, 3rd door (facing north)",
    rw: "Muri Gare ya Musanze: igorofa rya mbere, umuryango wa 3 (ureba mu majyaruguru)",
  } satisfies Record<AppLocale, string>,
} as const;
