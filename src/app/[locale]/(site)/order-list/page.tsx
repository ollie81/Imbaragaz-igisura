import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { OrderListView } from "@/components/order/order-list-view";
import { Container } from "@/components/ui/container";
import { buildContactLinks } from "@/lib/business/contact-links";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getBusinessInfo } from "@/server/business";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [t, business] = await Promise.all([
    getTranslations({ locale, namespace: "orderList" }),
    getBusinessInfo(locale),
  ]);
  return {
    ...buildPageMetadata({
      locale,
      path: "/order-list",
      title: t("title"),
      description: t("intro"),
      siteName: business.name,
    }),
    // Each visitor's list lives in their own browser; nothing to index.
    robots: { index: false, follow: true },
  };
}

/** The visitor's order list, sent to the business as one WhatsApp message. */
export default async function OrderListPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const [t, business] = await Promise.all([getTranslations("orderList"), getBusinessInfo(locale)]);
  const contacts = buildContactLinks(business);

  return (
    <Container className="pt-8 pb-16 sm:pt-12">
      <h1 className="text-4xl font-semibold text-leaf-900 sm:text-5xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t("intro")}</p>
      <div className="mt-8">
        <OrderListView
          businessName={business.name}
          whatsapp={contacts.whatsappAll.map(({ e164, display }) => ({ e164, display }))}
        />
      </div>
    </Container>
  );
}
