import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { WhatsAppFab } from "@/components/business/whatsapp-fab";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { buildContactLinks } from "@/lib/business/contact-links";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { getBusinessInfo } from "@/server/business";

// Public pages are static and refreshed in the background at most every
// 5 minutes. Admin edits can later trigger immediate revalidation.
export const revalidate = 300;

export default async function SiteLayout({
  children,
  params,
}: LocaleParams & { children: ReactNode }) {
  const locale = await resolveLocale(params);
  const [business, t] = await Promise.all([getBusinessInfo(locale), getTranslations("common")]);
  const contacts = buildContactLinks(business, t("whatsappMessage", { name: business.name }));

  return (
    <>
      <SkipLink label={t("skipToContent")} />
      <SiteHeader businessName={business.name} contacts={contacts} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter business={business} contacts={contacts} />
      {contacts.whatsapp && (
        <WhatsAppFab
          href={contacts.whatsapp.href}
          label={t("whatsapp")}
          ariaLabel={`${t("floatingWhatsapp")} ${t("opensInNewTab")}`}
        />
      )}
    </>
  );
}
