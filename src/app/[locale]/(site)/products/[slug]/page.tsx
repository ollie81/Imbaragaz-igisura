import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getFormatter, getTranslations } from "next-intl/server";

import { formatPrice, formatVariantSize } from "@/components/products/format";
import { ProductGallery } from "@/components/products/product-gallery";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, ChatIcon, InfoIcon, PhoneIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { buildContactLinks } from "@/lib/business/contact-links";
import { resolveLocale } from "@/lib/i18n/params";
import { catalogHref } from "@/lib/products/catalog-url";
import { productUrl, productWhatsappHref } from "@/lib/products/whatsapp";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/product-json-ld";
import { cn } from "@/lib/utils/cn";
import { productPath } from "@/lib/utils/product-paths";
import { getBusinessInfo } from "@/server/business";
import { getPublishedProduct } from "@/server/products";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Product pages are rendered on first visit and then cached (refreshed at most
// every 5 minutes, or immediately when a manager saves the product).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const [product, business] = await Promise.all([
    getPublishedProduct(locale, slug),
    getBusinessInfo(locale),
  ]);
  if (!product) return { robots: { index: false } };

  const image = product.images[0];
  return buildPageMetadata({
    locale,
    path: productPath(product.slug),
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    siteName: business.name,
    images: image
      ? [
          {
            url: image.url,
            width: image.width ?? undefined,
            height: image.height ?? undefined,
            alt: image.alt,
          },
        ]
      : undefined,
  });
}

function InfoSection({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <section
      className={cn(
        "rounded-card border p-6",
        tone === "warning" ? "border-gold-300 bg-accent-soft" : "border-border bg-background",
      )}
    >
      <h2 className="font-sans text-lg font-semibold text-leaf-900">{title}</h2>
      <div className="mt-2 leading-relaxed whitespace-pre-line text-leaf-950/85">{children}</div>
    </section>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const [product, business, t, format] = await Promise.all([
    getPublishedProduct(locale, slug),
    getBusinessInfo(locale),
    getTranslations(),
    getFormatter(),
  ]);
  if (!product) notFound();

  const tp = await getTranslations("product");
  const contacts = buildContactLinks(business);
  const message = tp("whatsappMessage", {
    business: business.name,
    name: product.name,
    url: productUrl(locale, product.slug),
  });
  const whatsappNumbers = contacts.whatsappAll.map((w) => ({
    ...w,
    href: productWhatsappHref(w.e164, message),
  }));
  const phone = contacts.phones[0];

  const variant = product.primaryVariant;
  const mainPrice =
    variant?.price != null ? formatPrice(format, variant.price, variant.currency) : null;
  const sizedVariants = product.variants
    .map((v) => ({
      ...v,
      size: formatVariantSize(v, format, tp),
      priceText: v.price != null ? formatPrice(format, v.price, v.currency) : null,
    }))
    .filter((v) => v.size || v.priceText);

  const crumbs = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.products"), path: "/products" },
    ...(product.category
      ? [{ name: product.category.name, path: catalogHref({ category: product.category.slug }) }]
      : []),
    { name: product.name, path: productPath(product.slug) },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product, locale, business.name)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, locale)} />

      <Container className="pt-6 pb-16 sm:pt-8">
        <nav aria-label={t("productPage.breadcrumb")} className="text-sm">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
            {crumbs.slice(0, -1).map((crumb) => (
              <li key={crumb.path} className="flex items-center gap-2">
                <Link
                  href={crumb.path}
                  className="inline-flex min-h-11 items-center hover:text-primary hover:underline"
                >
                  {crumb.name}
                </Link>
                <span aria-hidden="true">/</span>
              </li>
            ))}
            <li aria-current="page" className="font-medium text-leaf-900">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-4 grid gap-8 lg:mt-6 lg:grid-cols-2 lg:gap-14">
          <ProductGallery
            images={product.images}
            labels={{
              photoOf: t.raw("productPage.photoOf") as string,
              showPhoto: t.raw("productPage.showPhoto") as string,
            }}
          />

          <div>
            {product.category && (
              <p className="text-sm font-semibold tracking-wide text-gold-700 uppercase">
                <Link
                  href={catalogHref({ category: product.category.slug })}
                  className="inline-flex min-h-11 items-center hover:underline"
                >
                  {product.category.name}
                </Link>
              </p>
            )}
            <h1 className="mt-2 text-4xl leading-tight font-semibold text-leaf-900 sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {product.isFeatured && (
                <span className="rounded-full bg-gold-300 px-3 py-1 text-xs font-semibold text-leaf-950">
                  {tp("featured")}
                </span>
              )}
              {product.availability && (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    product.availability === "out_of_stock"
                      ? "bg-gold-100 text-gold-900"
                      : "bg-leaf-50 text-leaf-700",
                  )}
                >
                  {tp(`availability.${product.availability}`)}
                </span>
              )}
            </div>

            {product.contentLocale !== locale && (
              <p className="mt-4 flex gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                <InfoIcon className="mt-0.5 size-4 shrink-0" />
                {t("productPage.translationNote")}
              </p>
            )}

            {product.shortDescription && (
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            )}

            <p className="mt-6 text-3xl font-semibold text-leaf-900">
              {mainPrice ?? tp("priceOnRequest")}
            </p>

            {sizedVariants.length > 0 && (
              <section aria-labelledby="sizes-title" className="mt-6">
                <h2 id="sizes-title" className="font-sans text-base font-semibold text-leaf-900">
                  {t("productPage.sizesTitle")}
                </h2>
                <table className="mt-3 w-full overflow-hidden rounded-2xl border border-border text-left text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        {t("productPage.size")}
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right font-medium">
                        {t("productPage.price")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sizedVariants.map((v) => (
                      <tr key={v.id} className={v.isAvailable ? "" : "text-muted-foreground"}>
                        <td className="px-4 py-3 font-medium">
                          {v.size ?? "–"}
                          {!v.isAvailable && (
                            <span className="block text-xs font-normal">
                              {t("productPage.sizeUnavailable")}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-leaf-900">
                          {v.priceText ?? tp("priceOnRequest")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <div className="mt-8 rounded-card border border-gold-200 bg-accent-soft p-5 sm:p-6">
              <h2 className="font-sans text-lg font-semibold text-leaf-900">
                {t("productPage.askTitle", { name: product.name })}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("productPage.askText")}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {whatsappNumbers[0] && (
                  <a
                    href={whatsappNumbers[0].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({
                      variant: "accent",
                      size: "xl",
                      className: "sm:col-span-2",
                    })}
                  >
                    <ChatIcon />
                    {tp("askOnWhatsapp")}
                    <span className="sr-only"> {t("common.opensInNewTab")}</span>
                  </a>
                )}
                {phone && (
                  <a href={phone.href} className={buttonStyles({ variant: "outline", size: "lg" })}>
                    <PhoneIcon />
                    <span>
                      {t("common.call")} <span className="whitespace-nowrap">{phone.display}</span>
                    </span>
                  </a>
                )}
                {whatsappNumbers[1] && (
                  <a
                    href={whatsappNumbers[1].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({ variant: "outline", size: "lg" })}
                  >
                    <ChatIcon />
                    <span className="whitespace-nowrap">{whatsappNumbers[1].display}</span>
                    <span className="sr-only"> {t("common.opensInNewTab")}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {product.description && (
            <div className="lg:col-span-2">
              <InfoSection title={t("productPage.description")}>{product.description}</InfoSection>
            </div>
          )}
          {product.traditionalUse && (
            <InfoSection title={t("productPage.traditionalUse")}>
              <p>{product.traditionalUse}</p>
              <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
                <InfoIcon className="mt-0.5 size-4 shrink-0" />
                {t("productPage.traditionalUseNote")}
              </p>
            </InfoSection>
          )}
          {product.usageInstructions && (
            <InfoSection title={t("productPage.usage")}>{product.usageInstructions}</InfoSection>
          )}
          {product.ingredients && (
            <InfoSection title={t("productPage.ingredients")}>{product.ingredients}</InfoSection>
          )}
          {product.origin && (
            <InfoSection title={t("productPage.origin")}>{product.origin}</InfoSection>
          )}
          {product.storageInstructions && (
            <InfoSection title={t("productPage.storage")}>
              {product.storageInstructions}
            </InfoSection>
          )}
          {product.warnings && (
            <InfoSection title={t("productPage.warnings")} tone="warning">
              {product.warnings}
            </InfoSection>
          )}
        </div>

        {(product.traditionalUse || product.usageInstructions) && (
          <p className="mt-6 flex max-w-3xl gap-2 text-sm leading-relaxed text-muted-foreground">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-leaf-600" />
            {t("productPage.healthNote")}
          </p>
        )}

        <div className="mt-12">
          <Link href="/products" className={buttonStyles({ variant: "outline", size: "lg" })}>
            {t("productPage.backToProducts")}
            <ArrowRightIcon />
          </Link>
        </div>
      </Container>
    </>
  );
}
