import { getLocale, getTranslations } from "next-intl/server";

import { SearchIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { catalogHref } from "@/lib/products/catalog-url";

type CatalogSearchProps = { query: string; category?: string };

/**
 * Search form. A plain GET form: it works before (or without) JavaScript and
 * produces shareable URLs like /rw/products?q=tangawizi.
 */
export async function CatalogSearch({ query, category }: CatalogSearchProps) {
  const [t, locale] = await Promise.all([getTranslations("products"), getLocale()]);

  return (
    <form action={`/${locale}/products`} method="get" role="search" className="w-full max-w-2xl">
      {category && <input type="hidden" name="category" value={category} />}
      <label htmlFor="catalog-search" className="sr-only">
        {t("searchLabel")}
      </label>
      <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5 pl-4 shadow-card focus-within:border-leaf-400">
        <SearchIcon className="size-5 shrink-0 text-muted-foreground" />
        <input
          id="catalog-search"
          type="search"
          name="q"
          defaultValue={query}
          maxLength={80}
          placeholder={t("searchPlaceholder")}
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-11 w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {t("searchButton")}
        </button>
      </div>
      {query && (
        <p className="mt-2 pl-4 text-sm">
          <Link
            href={catalogHref({ category })}
            className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("clearSearch")}
          </Link>
        </p>
      )}
    </form>
  );
}
