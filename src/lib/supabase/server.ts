import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabasePublicEnv } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Session-aware client for Server Components, Server Actions and Route
 * Handlers. It acts as the signed-in user, so RLS applies with their identity.
 * Create a new one per request; never share it.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = requireSupabasePublicEnv();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy (src/proxy.ts) refreshes the session instead.
        }
      },
    },
  });
}
