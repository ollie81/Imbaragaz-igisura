import "server-only";

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ValidationError extends Error {
  constructor(
    public readonly key: string,
    public readonly field?: string,
    public readonly values?: Record<string, string>,
  ) {
    super(key);
  }
}

/** Trimmed text, null when empty; throws when longer than `max`. */
export function text(formData: FormData, name: string, max = 5000): string | null {
  const raw = formData.get(name);
  const value = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  if (value.length > max) throw new ValidationError("errors.tooLong", name);
  return value || null;
}

export function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

export function uuid(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new ValidationError("errors.notFound");
  }
  return value;
}

export function optionalUuid(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && UUID_PATTERN.test(value) ? value : null;
}

/** Whole number (e.g. display order). */
export function integer(formData: FormData, name: string, fallback = 0): number {
  const value = text(formData, name, 12);
  if (value === null) return fallback;
  if (!/^-?\d+$/.test(value)) throw new ValidationError("errors.orderInvalid", name);
  return Number.parseInt(value, 10);
}

/**
 * Positive decimal typed by a person: "5000", "5 000", "5,000", "2.5".
 * Returns null when empty. A comma followed by exactly 3 digits is treated as
 * a thousands separator; otherwise a single comma is a decimal separator.
 */
export function decimal(formData: FormData, name: string, errorKey: string): number | null {
  const raw = text(formData, name, 20);
  if (raw === null) return null;
  let value = raw.replace(/\s/g, "");
  value = /,\d{3}(?!\d)/.test(value) ? value.replace(/,/g, "") : value.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(value)) throw new ValidationError(errorKey, name);
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1e9) {
    throw new ValidationError(errorKey, name);
  }
  return number;
}

/** "Amavuta y'Ibihwagari" → "amavuta-yibihwagari" */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function slug(formData: FormData, name: string): string {
  const value = text(formData, name, 80);
  if (!value || !SLUG_PATTERN.test(value)) throw new ValidationError("errors.slugInvalid", name);
  return value;
}
