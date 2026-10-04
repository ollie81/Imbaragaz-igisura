import { getTranslations } from "next-intl/server";

import { ProductGrid } from "@/components/products/product-grid";
import { buttonStyles } from "@/components/ui/button";
import { ChatIcon, PhoneIcon, SproutIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionIds } from "@/config/navigation";
import type { ContactLinks } from "@/lib/business/contact-links";
import type { ProductSummary } from "@/server/products";

type FeaturedProductsProps = {
  products: ProductSummary[];
  contacts: ContactLinks;
};

/** Real products from the database, or an honest "coming soon" state when there are none. */
export async function FeaturedProducts({ products, contacts }: FeaturedProductsProps) {
  const t = await getTranslations();
  const phone = contacts.phones[0];

  return (
    <Section id={sectionIds.products} aria-labelledby="products-title">
      <SectionHeading
        id="products-title"
        eyebrow={t("home.products.eyebrow")}
        title={t("home.products.title")}
        description={t("home.products.description")}
      />

      <div className="mt-10">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="relative overflow-hidden rounded-card border border-dashed border-leaf-200 bg-leaf-50/60 px-6 py-10 text-center sm:px-10 sm:py-14">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-background text-primary shadow-card">
              <SproutIcon className="size-8" />
            </span>
            <h3 className="mx-auto mt-6 max-w-lg text-2xl font-semibold text-leaf-900">
              {t("home.products.emptyTitle")}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {t("home.products.emptyDescription")}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              {contacts.whatsapp && (
                <a
                  href={contacts.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "accent", size: "lg" })}
                >
                  <ChatIcon />
                  {t("home.products.askOnWhatsapp")}
                  <span className="sr-only"> {t("common.opensInNewTab")}</span>
                </a>
              )}
              {phone && (
                <a href={phone.href} className={buttonStyles({ variant: "outline", size: "lg" })}>
                  <PhoneIcon />
                  {t("common.callNumber", { number: phone.display })}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
