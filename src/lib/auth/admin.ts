import "server-only";

import { connection } from "next/server";
import { cache } from "react";

import { isSupabaseConfigured } from "@/config/env";
import type { AppLocale } from "@/i18n/config";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type AdminRole = "owner" | "manager" | "editor";

export type CurrentAdmin = {
  userId: string;
  email: string | null;
  fullName: string;
  role: AdminRole;
};

/**
 * Returns the signed-in, active administrator, or null.
 *
 * `getUser()` verifies the session with Supabase Auth (it does not trust the
 * cookie alone). Membership is read from `public.admins`, which RLS lets a
 * user see only for themselves.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  // Always evaluate per request: an admin check must never be prerendered.
  await connection();
  if (!isSupabaseConfigured) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admins")
    .select("user_id, full_name, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle<Pick<Tables<"admins">, "user_id" | "full_name" | "role" | "is_active">>();

  if (!data?.is_active) return null;

  return {
    userId: data.user_id,
    email: user.email ?? null,
    fullName: data.full_name,
    role: data.role as AdminRole,
  };
});

/**
 * Guard for admin pages and Server Actions. Redirects to the admin sign-in
 * page when the visitor is not an active administrator.
 *
 * UI checks are a convenience only: every write is ALSO enforced by RLS.
 */
export async function requireAdmin(locale: AppLocale, allowedRoles?: readonly AdminRole[]) {
  const admin = await getCurrentAdmin();
  if (!admin || (allowedRoles && !allowedRoles.includes(admin.role))) {
    redirect({ href: "/admin/login", locale });
  }
  return admin as CurrentAdmin;
}
