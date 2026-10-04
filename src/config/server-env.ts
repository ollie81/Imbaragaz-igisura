import "server-only";

/**
 * Server-only secrets. Importing this module from a Client Component fails
 * the build (via `server-only`), so these values can never reach the browser.
 */
export function getSupabaseSecretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error("SUPABASE_SECRET_KEY is not set (see .env.example).");
  }
  return key;
}
