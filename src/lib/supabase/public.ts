import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireSupabasePublicEnv } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Cookie-less client for PUBLIC data (published products, business info).
 *
 * It never reads the visitor's session, so pages that use it stay statically
 * renderable / cacheable. Row Level Security limits it to public rows.
 */
export function createSupabasePublicClient() {
  const { url, key } = requireSupabasePublicEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
