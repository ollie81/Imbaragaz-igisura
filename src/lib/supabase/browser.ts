"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Client for Client Components (e.g. admin image uploads). Uses only the
 * publishable key; every request is still checked by Row Level Security.
 */
export function createSupabaseBrowserClient() {
  const { url, key } = requireSupabasePublicEnv();
  return createBrowserClient<Database>(url, key);
}
