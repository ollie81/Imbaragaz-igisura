import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import { isSupabaseConfigured, publicEnv } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session (if any) and writes updated cookies to
 * `response`. Runs in the proxy for admin routes only, so public pages are
 * never made dynamic by auth.
 *
 * This is NOT an authorization check — admin pages verify access on the
 * server (see src/lib/auth/admin.ts) and the database enforces it with RLS.
 */
export async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // Validates the JWT and triggers a token refresh when needed.
  await supabase.auth.getClaims();

  return response;
}
