import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AboutPreview } from "@/components/home/about-preview";
import { ContactCta } from "@/components/home/contact-cta";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { Highlights } from "@/components/home/highlights";
import { HowToOrder } from "@/components/home/how-to-order";
import { LocationHours } from "@/components/home/location-hours";
import { ProductInfo } from "@/components/home/product-info";
import { WhyChoose } from "@/components/home/why-choose";
import { JsonLd } from "@/components/seo/json-ld";
import { buildContactLinks } from "@/lib/business/contact-links";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { localBusinessJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getBusinessInfo } from "@/server/business";
import { getFeaturedProducts } from "@/server/products";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [t, business] = await Promise.all([
    getTranslations({ locale, namespace: "metadata" }),
    getBusinessInfo(locale),
  ]);
  const title = `${business.name} | ${t("title")}`;

  return {
    ...buildPageMetadata({
      locale,
      path: "/",
      title,
      description: t("description", { years: business.experienceYears }),
      siteName: business.name,
    }),
    title: { absolute: title },
  };
}

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const [t, business, products] = await Promise.all([
    getTranslations(),
    getBusinessInfo(locale),
    getFeaturedProducts(locale),
  ]);
  const contacts = buildContactLinks(
    business,
    t("common.whatsappMessage", { name: business.name }),
  );

  return (
    <>
      <JsonLd
        data={localBusinessJsonLd(business, locale, {
          description: t("metadata.description", { years: business.experienceYears }),
        })}
      />
      <Hero
        business={business}
        contacts={contacts}
        image={
          business.shopPhoto
            ? {
                src: business.shopPhoto.url,
                alt: t("home.hero.photoAlt", { name: business.name }),
                width: business.shopPhoto.width ?? 1200,
                height: business.shopPhoto.height ?? 1600,
              }
            : undefined
        }
      />
      <Highlights business={business} />
      <FeaturedProducts products={products} contacts={contacts} businessName={business.name} />
      <WhyChoose experienceYears={business.experienceYears} />
      <HowToOrder />
      <ProductInfo />
      <AboutPreview business={business} />
      <ContactCta contacts={contacts} />
      <LocationHours business={business} />
      <FinalCta name={business.name} contacts={contacts} />
    </>
  );
}
