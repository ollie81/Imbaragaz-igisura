"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/config/env";
import { defaultLocale, locales, type AppLocale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { fail, type FormState } from "./form";

function readLocale(formData: FormData): AppLocale {
  const value = formData.get("locale");
  return (locales as readonly string[]).includes(String(value))
    ? (value as AppLocale)
    : defaultLocale;
}

/**
 * Email + password sign-in for administrators. Only accounts with an active
 * row in public.admins are let in; any other account is signed out again.
 */
export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return fail("login.errors.missingFields");
  if (!isSupabaseConfigured) return fail("login.errors.unavailable");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    const wrongCredentials = error?.code === "invalid_credentials" || error?.status === 400;
    return fail(wrongCredentials ? "login.errors.invalidCredentials" : "login.errors.unavailable");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!admin?.is_active) {
    await supabase.auth.signOut();
    return fail("login.errors.notAuthorized");
  }

  redirect(`/${locale}/admin`);
}

export async function signOutAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData);
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect(`/${locale}/admin/login`);
}
