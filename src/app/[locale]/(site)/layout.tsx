import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { siteConfig } from "@/config/site";
import type { AppLocale } from "@/i18n/config";
import { getBusinessInfo } from "@/server/business";

// Public pages are static and refreshed in the background at most every
// 5 minutes. Admin edits can later trigger immediate revalidation.
export const revalidate = 300;

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: AppLocale };
  setRequestLocale(locale);

  const [business, t] = await Promise.all([getBusinessInfo(locale), getTranslations("common")]);
  const businessName = business?.name ?? siteConfig.fallbackName;

  return (
    <>
      <SkipLink label={t("skipToContent")} />
      <SiteHeader businessName={businessName} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter businessName={businessName} business={business} />
    </>
  );
}
