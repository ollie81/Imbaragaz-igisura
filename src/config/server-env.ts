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

/**
 * OpenAI API key for the admin "Write a draft with AI" button.
 * Optional: without it the button is hidden.
 */
export function getOpenAiApiKey(): string | null {
  return process.env.OPENAI_API_KEY || null;
}

/** GPT model used for drafts; override with OPENAI_MODEL without changing code. */
export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL || "gpt-5.5";
}
