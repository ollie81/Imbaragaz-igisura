import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { catalogHref, type CatalogParams } from "@/lib/products/catalog-url";

type PaginationProps = { page: number; pageCount: number; params: Omit<CatalogParams, "page"> };

/** Previous / next links with the current position. Plain links: crawlable and shareable. */
export async function Pagination({ page, pageCount, params }: PaginationProps) {
  const t = await getTranslations("products");
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={t("pagination")} className="mt-10 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link
          href={catalogHref({ ...params, page: page - 1 })}
          rel="prev"
          className={buttonStyles({ variant: "outline" })}
        >
          {t("previous")}
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted-foreground" aria-current="page">
        {t("pageOf", { page, total: pageCount })}
      </p>
      {page < pageCount ? (
        <Link
          href={catalogHref({ ...params, page: page + 1 })}
          rel="next"
          className={buttonStyles({ variant: "outline" })}
        >
          {t("next")}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
