import "server-only";

import { revalidatePath } from "next/cache";

import { getCurrentAdmin, type AdminRole, type CurrentAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { fail, type FormState } from "./form";
import { ValidationError } from "./validation";

type AdminContext = {
  admin: CurrentAdmin;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
};

/**
 * Runs an admin mutation: verifies the session belongs to an active admin
 * (server-side; never trusts the browser), provides a Supabase client acting
 * AS that user (so Row Level Security applies), maps validation errors to
 * form messages, and refreshes cached public pages afterwards.
 */
export async function runAdminAction(
  fn: (ctx: AdminContext) => Promise<FormState | void>,
  allowedRoles?: readonly AdminRole[],
): Promise<FormState> {
  const admin = await getCurrentAdmin();
  if (!admin || (allowedRoles && !allowedRoles.includes(admin.role))) {
    return fail("errors.notAuthorized");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const result = await fn({ admin, supabase });
    // Products, categories and the home page are cached; refresh them.
    revalidatePath("/", "layout");
    return result ?? { status: "success", message: "productForm.saved", at: Date.now() };
  } catch (error) {
    if (error instanceof ValidationError) {
      return fail(error.key, error.field ? { [error.field]: error.key } : undefined, error.values);
    }
    // redirect() and notFound() throw special errors that must propagate.
    if (error instanceof Error && "digest" in error) throw error;
    console.error("[admin] action failed:", error instanceof Error ? error.message : error);
    return fail("errors.generic");
  }
}

/** Throws a ValidationError for a Supabase/PostgREST error, mapping known cases. */
export function assertNoDbError(
  error: { code?: string; message: string } | null,
  uniqueField?: string,
): void {
  if (!error) return;
  if (error.code === "23505" && uniqueField) {
    throw new ValidationError("errors.slugTaken", uniqueField);
  }
  if (error.code === "42501") throw new ValidationError("errors.notAuthorized");
  throw new Error(error.message);
}
