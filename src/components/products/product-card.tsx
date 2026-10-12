import Image from "next/image";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import { ArrowRightIcon, ChatIcon, LeafIcon } from "@/components/ui/icons";
import type { AppLocale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { productPath } from "@/lib/utils/product-paths";
import { productUrl, productWhatsappHref } from "@/lib/products/whatsapp";
import type { ProductSummary } from "@/server/products";

import { formatPrice, formatVariantSize } from "./format";

export type ProductContact = { businessName: string; whatsappE164: string | null };

type ProductCardProps = {
  product: ProductSummary;
  contact: ProductContact;
  /** Set on cards visible on first load (e.g. the first row) to load their image eagerly. */
  priority?: boolean;
  headingLevel?: "h2" | "h3";
};

/**
 * Product card used on the home page and the Products page.
 * Every value comes from the database; missing values are simply not shown.
 */
export async function ProductCard({
  product,
  contact,
  priority,
  headingLevel = "h3",
}: ProductCardProps) {
  const [t, format, locale] = await Promise.all([
    getTranslations("product"),
    getFormatter(),
    getLocale() as Promise<AppLocale>,
  ]);
  const Heading = headingLevel;
  const variant = product.primaryVariant;
  const sizeText = variant ? formatVariantSize(variant, format, t) : null;
  const price =
    variant?.price != null ? formatPrice(format, variant.price, variant.currency) : null;
  const unavailable = product.availability === "out_of_stock";

  const whatsapp = contact.whatsappE164
    ? productWhatsappHref(
        contact.whatsappE164,
        t("whatsappMessage", {
          business: contact.businessName,
          name: product.name,
          url: productUrl(locale, product.slug),
        }),
      )
    : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-background shadow-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-leaf-50">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          // Neutral placeholder until the business uploads a real photo.
          <div className="grid h-full place-items-center text-leaf-300" aria-hidden="true">
            <LeafIcon className="size-14" />
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 rounded-full bg-gold-300 px-3 py-1 text-xs font-semibold text-leaf-950 shadow-sm">
            {t("featured")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-gold-700 uppercase">
            <span className="sr-only">{t("category")}: </span>
            {product.category.name}
          </p>
        )}
        <Heading className="text-xl leading-snug font-semibold text-leaf-900">
          {product.name}
        </Heading>
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-muted-foreground">{product.shortDescription}</p>
        )}

        {(sizeText || product.availability) && (
          <dl className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {sizeText && (
              <div>
                <dt className="sr-only">{t("sizeLabel")}</dt>
                <dd className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-leaf-800">
                  {sizeText}
                  {product.variantCount > 1 && (
                    <span className="text-muted-foreground">
                      {" "}
                      {t("moreSizes", { count: product.variantCount - 1 })}
                    </span>
                  )}
                </dd>
              </div>
            )}
            {product.availability && (
              <div>
                <dt className="sr-only">{t("availabilityLabel")}</dt>
                <dd className={cn("font-medium", unavailable ? "text-gold-800" : "text-leaf-600")}>
                  {t(`availability.${product.availability}`)}
                </dd>
              </div>
            )}
          </dl>
        )}

        <p className="mt-auto pt-5 text-lg font-semibold text-leaf-900">
          {price ?? t("priceOnRequest")}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={productPath(product.slug)}
            aria-label={t("viewDetailsOf", { name: product.name })}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-primary transition-colors after:absolute after:inset-0 after:content-[''] hover:bg-muted"
          >
            {t("viewDetails")}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("askAboutOnWhatsapp", { name: product.name })}
              title={t("askOnWhatsapp")}
              // Sits above the card-wide link so it stays separately clickable.
              className="relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              <ChatIcon className="size-5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
