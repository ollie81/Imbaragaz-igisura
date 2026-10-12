/**
 * Shared types and helpers for admin forms (server actions + client forms).
 * Messages are translation keys under the "admin" namespace, so the client
 * shows them in the manager's language.
 */
export type FormState = {
  status: "idle" | "success" | "error";
  /** Translation key under "admin", e.g. "errors.slugTaken". */
  message?: string;
  /** Values for the message, e.g. { language: "English" }. */
  values?: Record<string, string>;
  /** Field name → translation key. */
  fieldErrors?: Record<string, string>;
  /** Changes on every submission so the UI can react to repeated results. */
  at?: number;
};

export const idleState: FormState = { status: "idle" };

export const ok = (message = "productForm.saved"): FormState => ({
  status: "success",
  message,
  at: Date.now(),
});

export const fail = (
  message: string,
  fieldErrors?: Record<string, string>,
  values?: Record<string, string>,
): FormState => ({ status: "error", message, fieldErrors, values, at: Date.now() });
