import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CatalogHelp } from "@/components/catalog/catalog-help";
import { CatalogMessage } from "@/components/catalog/catalog-message";
import { CatalogSearch } from "@/components/catalog/catalog-search";
import { CategoryFilter } from "@/components/catalog/category-filter";
import { Pagination } from "@/components/catalog/pagination";
import { ProductGrid } from "@/components/products/product-grid";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ChatIcon, SearchIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { buildContactLinks } from "@/lib/business/contact-links";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { catalogHref, readParam } from "@/lib/products/catalog-url";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getBusinessInfo } from "@/server/business";
import {
  getCatalogCategories,
  listPublishedProducts,
  normalizeSearchQuery,
} from "@/server/products";

type Props = LocaleParams & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function readFilters(searchParams: Props["searchParams"]) {
  const sp = await searchParams;
  const page = Number.parseInt(readParam(sp.page) ?? "1", 10);
  return {
    q: normalizeSearchQuery(readParam(sp.q)),
    category: readParam(sp.category),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [t, business, filters] = await Promise.all([
    getTranslations({ locale, namespace: "products" }),
    getBusinessInfo(locale),
    readFilters(searchParams),
  ]);

  const metadata = buildPageMetadata({
    locale,
    path: catalogHref({ category: filters.category, page: filters.page }),
    title: t("metaTitle"),
    description: t("metaDescription"),
    siteName: business.name,
  });
  // Search result pages are useful for visitors, not as search-engine entries.
  return filters.q ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const filters = await readFilters(searchParams);
  const [t, business, categories, result] = await Promise.all([
    getTranslations(),
    getBusinessInfo(locale),
    getCatalogCategories(locale),
    listPublishedProducts({
      locale,
      query: filters.q,
      categorySlug: filters.category,
      page: filters.page,
    }),
  ]);
  const contacts = buildContactLinks(
    business,
    t("common.whatsappMessage", { name: business.name }),
  );
  const filtered = Boolean(filters.q || filters.category);
  const activeCategory = categories.find((c) => c.slug === filters.category);

  return (
    <>
      <section
        aria-labelledby="products-title"
        className="border-b border-border bg-gradient-to-b from-leaf-50 to-background"
      >
        <Container className="py-10 sm:py-14">
          <p className="mb-3 text-sm font-semibold tracking-wide text-gold-700 uppercase">
            {t("products.eyebrow")}
          </p>
          <h1
            id="products-title"
            className="text-4xl leading-tight font-semibold text-leaf-900 sm:text-5xl"
          >
            {activeCategory?.name ?? t("products.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("products.intro")}
          </p>
          <div className="mt-8">
            <CatalogSearch query={filters.q} category={filters.category} />
          </div>
        </Container>
      </section>

      <Container className="py-8 sm:py-10">
        <CategoryFilter categories={categories} active={filters.category} query={filters.q} />

        {result.total > 0 && (
          <p className="mt-6 mb-5 text-sm text-muted-foreground" role="status">
            {t("products.resultsCount", { count: result.total })}
            {filters.q && <> {t("products.resultsFor", { query: filters.q })}</>}
          </p>
        )}

        <div className={result.total > 0 ? "" : "mt-6"}>
          {result.items.length > 0 ? (
            <ProductGrid
              products={result.items}
              headingLevel="h2"
              contact={{
                businessName: business.name,
                whatsappE164: contacts.whatsapp?.e164 ?? null,
              }}
            />
          ) : filtered || result.total > 0 ? (
            <CatalogMessage
              title={t("products.noResultsTitle")}
              text={t("products.noResultsText")}
              icon={<SearchIcon />}
            >
              <Link href="/products" className={buttonStyles({ size: "lg" })}>
                {t("products.showAll")}
              </Link>
            </CatalogMessage>
          ) : (
            <CatalogMessage title={t("products.emptyTitle")} text={t("products.emptyText")}>
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
            </CatalogMessage>
          )}
        </div>

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          params={{ q: filters.q, category: filters.category }}
        />

        {result.items.length > 0 && <CatalogHelp contacts={contacts} />}
      </Container>
    </>
  );
}
