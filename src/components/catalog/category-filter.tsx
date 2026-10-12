import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { catalogHref } from "@/lib/products/catalog-url";
import { cn } from "@/lib/utils/cn";
import type { CatalogCategory } from "@/server/products";

type CategoryFilterProps = {
  categories: CatalogCategory[];
  active?: string;
  query?: string;
};

/** Category chips. Scroll sideways on phones; wrap on larger screens. */
export async function CategoryFilter({ categories, active, query }: CategoryFilterProps) {
  const t = await getTranslations("products");
  if (categories.length === 0) return null;

  const chip = (selected: boolean) =>
    cn(
      "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
      selected
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-leaf-900 hover:border-leaf-300 hover:bg-leaf-50",
    );

  return (
    <nav aria-label={t("categoriesLabel")}>
      <ul className="-mx-4 flex [scrollbar-width:thin] gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <li>
          <Link
            href={catalogHref({ q: query })}
            aria-current={!active ? "page" : undefined}
            className={chip(!active)}
          >
            {t("allCategories")}
          </Link>
        </li>
        {categories.map((category) => {
          const selected = category.slug === active;
          return (
            <li key={category.slug}>
              <Link
                href={catalogHref({ q: query, category: category.slug })}
                aria-current={selected ? "page" : undefined}
                className={chip(selected)}
              >
                {category.name}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    selected ? "bg-white/20" : "bg-muted text-muted-foreground",
                  )}
                >
                  {category.productCount}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
