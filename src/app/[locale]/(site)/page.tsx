import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactActions } from "@/components/business/contact-actions";
import { OpeningHours } from "@/components/business/opening-hours";
import { JsonLd } from "@/components/seo/json-ld";
import { Card } from "@/components/ui/card";
import { ClockIcon, MapPinIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import type { AppLocale } from "@/i18n/config";
import { localBusinessJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getBusinessInfo } from "@/server/business";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: AppLocale };
  const [t, business] = await Promise.all([
    getTranslations({ locale, namespace: "metadata" }),
    getBusinessInfo(locale),
  ]);
  const name = business?.name ?? siteConfig.fallbackName;

  return {
    ...buildPageMetadata({ locale, path: "/", description: t("description"), siteName: name }),
    title: { absolute: name },
  };
}

/**
 * Temporary home page: a clean "contact us" holding page that exercises the
 * layout, design system, i18n and database integration. It will be replaced
 * by the real home page once content and photos are ready.
 */
export default async function HomePage({ params }: Props) {
  const { locale } = (await params) as { locale: AppLocale };
  setRequestLocale(locale);

  const [t, business] = await Promise.all([getTranslations(), getBusinessInfo(locale)]);
  const name = business?.name ?? siteConfig.fallbackName;

  return (
    <>
      {business && <JsonLd data={localBusinessJsonLd(business, locale)} />}

      <Section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 to-background">
        <div className="max-w-2xl py-6 sm:py-10">
          <p className="mb-4 inline-flex rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-gold-800">
            {t("home.eyebrow")}
          </p>
          <h1 className="text-4xl font-semibold text-leaf-900 sm:text-5xl lg:text-6xl">{name}</h1>
          <p className="mt-4 text-xl text-leaf-700 sm:text-2xl">
            {business?.tagline ?? t("home.tagline")}
          </p>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("home.intro")}</p>
          {business && (
            <ContactActions
              phones={business.phones}
              whatsapp={business.whatsapp}
              className="mt-8"
            />
          )}
        </div>
      </Section>

      {business && (business.address || business.hours.length > 0) && (
        <Section aria-labelledby="visit-us">
          <h2 id="visit-us" className="mb-6 text-2xl font-semibold text-leaf-900 sm:text-3xl">
            {t("home.visitUs")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(business.address || business.locationDescription) && (
              <Card className="flex gap-4">
                <MapPinIcon className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-sans font-semibold">{t("common.location")}</h3>
                  <address className="mt-1 text-muted-foreground not-italic">
                    {business.address && <p>{business.address}</p>}
                    {business.locationDescription && <p>{business.locationDescription}</p>}
                  </address>
                </div>
              </Card>
            )}
            {business.hours.length > 0 && (
              <Card className="flex gap-4">
                <ClockIcon className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-sans font-semibold">{t("common.openingHours")}</h3>
                  <div className="mt-1 text-muted-foreground">
                    <OpeningHours hours={business.hours} />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Section>
      )}
    </>
  );
}
