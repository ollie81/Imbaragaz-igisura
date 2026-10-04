import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireSupabasePublicEnv } from "@/config/env";
import { getSupabaseSecretKey } from "@/config/server-env";
import type { Database } from "@/types/database";

/**
 * Privileged client that BYPASSES Row Level Security.
 *
 * Only for trusted server-side jobs that have already authorized the caller
 * (e.g. future admin-user management, webhooks). Never use it to serve
 * public pages, and never import it from client code (`server-only` enforces
 * the latter).
 */
export function createSupabaseServiceRoleClient() {
  const { url } = requireSupabasePublicEnv();
  return createClient<Database>(url, getSupabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
