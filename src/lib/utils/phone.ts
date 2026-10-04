/**
 * Phone helpers. Numbers are stored in E.164 (e.g. "+250788000000") and
 * formatted for display here, so the database stays the single source of truth.
 */

const RWANDA_PREFIX = "+250";

/** "+250788123456" → "0788 123 456"; other countries are returned unchanged. */
export function formatPhoneForDisplay(e164: string): string {
  if (e164.startsWith(RWANDA_PREFIX) && e164.length === 13) {
    const local = `0${e164.slice(RWANDA_PREFIX.length)}`;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return e164;
}

export function telHref(e164: string): string {
  return `tel:${e164}`;
}

/** WhatsApp click-to-chat link, optionally with a pre-filled message. */
export function whatsappHref(e164: string, message?: string): string {
  const url = `https://wa.me/${e164.replace(/^\+/, "")}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
