import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Supabase connection, accepted under several names so it can be set in
 * Vercel without the NEXT_PUBLIC_ prefix (e.g. SUPABASE_URL +
 * SUPABASE_ANON_KEY, the names Supabase's Vercel integration uses).
 * Only the URL and the PUBLISHABLE/anon key are passed to the browser.
 */
const supabaseUrlValue = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseKeyValue =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  "";

/** Refuses to build if a SECRET key was put where the public key belongs. */
function assertNotSecretKey(key: string) {
  if (key.startsWith("sb_secret_")) {
    throw new Error(
      "A Supabase SECRET key was provided as the public key. Use the publishable/anon key.",
    );
  }
  const payload = key.split(".")[1];
  if (payload) {
    try {
      const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      if (claims?.role === "service_role") {
        throw new Error(
          "A Supabase service_role key was provided as the public key. Use the anon key.",
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("service_role")) throw error;
    }
  }
}
assertNotSecretKey(supabaseKeyValue);

// Allow next/image to optimize files from this project's Supabase Storage only.
const supabaseUrl = supabaseUrlValue ? new URL(supabaseUrlValue) : undefined;
// Local Supabase (`supabase start`) runs on 127.0.0.1/localhost. Only then may
// the optimizer fetch from a local address; production uses *.supabase.co.
const isLocalSupabase =
  supabaseUrl !== undefined && ["127.0.0.1", "localhost"].includes(supabaseUrl.hostname);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Inlined at build time for server and browser code (see src/config/env.ts).
  env: {
    APP_SUPABASE_URL: supabaseUrlValue,
    APP_SUPABASE_PUBLISHABLE_KEY: supabaseKeyValue,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: isLocalSupabase,
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol === "http:" ? "http" : "https",
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
