import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AboutPreview } from "@/components/home/about-preview";
import { ContactCta } from "@/components/home/contact-cta";
import { LocationHours } from "@/components/home/location-hours";
import { WhyChoose } from "@/components/home/why-choose";
import { buildContactLinks } from "@/lib/business/contact-links";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getBusinessInfo } from "@/server/business";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [t, business] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getBusinessInfo(locale),
  ]);

  return buildPageMetadata({
    locale,
    path: "/about",
    title: t("metaTitle"),
    description: t("metaDescription", { years: business.experienceYears }),
    siteName: business.name,
  });
}

/**
 * About page. Assembled from the same confirmed-facts sections as the home
 * page; a fuller story can be added once the family provides it.
 */
export default async function AboutPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const [t, business] = await Promise.all([getTranslations(), getBusinessInfo(locale)]);
  const contacts = buildContactLinks(
    business,
    t("common.whatsappMessage", { name: business.name }),
  );

  return (
    <>
      <AboutPreview business={business} showLink={false} headingLevel="h1" />
      <WhyChoose experienceYears={business.experienceYears} />
      <LocationHours business={business} />
      <ContactCta contacts={contacts} />
    </>
  );
}
