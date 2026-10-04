import { formatPhoneForDisplay, telHref, whatsappHref } from "@/lib/utils/phone";
import { primaryContact, type BusinessInfo } from "@/server/business";

export type ContactLink = { href: string; display: string; e164: string };

export type ContactLinks = {
  /** Primary WhatsApp chat (with a pre-filled greeting), or null. */
  whatsapp: ContactLink | null;
  /** Every WhatsApp number, primary first. */
  whatsappAll: ContactLink[];
  /** Every phone number, primary first. */
  phones: ContactLink[];
};

function primaryFirst<T extends { is_primary: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
}

/**
 * Builds tel: and wa.me links from the business's contacts (E.164 numbers),
 * so every call/WhatsApp button on the site uses the same, correct format.
 */
export function buildContactLinks(business: BusinessInfo, whatsappMessage?: string): ContactLinks {
  const toWhatsapp = (e164: string): ContactLink => ({
    href: whatsappHref(e164, whatsappMessage),
    display: formatPhoneForDisplay(e164),
    e164,
  });
  const primary = primaryContact(business.whatsapp);

  return {
    whatsapp: primary ? toWhatsapp(primary.value) : null,
    whatsappAll: primaryFirst(business.whatsapp).map((c) => toWhatsapp(c.value)),
    phones: primaryFirst(business.phones).map((c) => ({
      href: telHref(c.value),
      display: formatPhoneForDisplay(c.value),
      e164: c.value,
    })),
  };
}
