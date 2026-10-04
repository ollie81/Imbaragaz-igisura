/**
 * Public (browser-safe) environment variables.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so each one must be read
 * with a literal `process.env.NAME` expression. Server-only secrets live in
 * `src/config/server-env.ts`, which cannot be imported from client code.
 */

const DEFAULT_SITE_URL = "http://localhost:3000";

export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
} as const;

/** True when the Supabase URL and publishable key are both configured. */
export const isSupabaseConfigured = Boolean(
  publicEnv.supabaseUrl && publicEnv.supabasePublishableKey,
);

export function requireSupabasePublicEnv() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).",
    );
  }
  return { url: publicEnv.supabaseUrl, key: publicEnv.supabasePublishableKey };
}
