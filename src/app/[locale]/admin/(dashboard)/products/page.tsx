import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { LeafIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { readParam } from "@/lib/products/catalog-url";
import { cn } from "@/lib/utils/cn";
import { listAdminProducts } from "@/server/admin/catalog";

type Props = LocaleParams & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-leaf-50 text-leaf-700",
  archived: "bg-gold-100 text-gold-900",
} as const;

export default async function AdminProductsPage({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale);
  const sp = await searchParams;
  const q = (readParam(sp.q) ?? "").toLowerCase();
  const status = readParam(sp.status);
  const [t, products] = await Promise.all([getTranslations("admin"), listAdminProducts(locale)]);

  const shown = products.filter(
    (p) =>
      (!status || p.status === status) &&
      (!q || p.name?.toLowerCase().includes(q) || p.slug.includes(q)),
  );
  const filters = [
    { value: undefined, label: t("products.all") },
    { value: "draft", label: t("status.draft") },
    { value: "published", label: t("status.published") },
    { value: "archived", label: t("status.archived") },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-leaf-900">{t("products.title")}</h1>
        <Link href="/admin/products/new" className={buttonStyles({ size: "lg" })}>
          {t("products.new")}
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="admin-q" className="sr-only">
          {t("products.filterPlaceholder")}
        </label>
        <input
          id="admin-q"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t("products.filterPlaceholder")}
          className="min-h-11 w-full rounded-full border border-border bg-background px-4 sm:max-w-xs"
        />
        <ul className="flex flex-wrap gap-1">
          {filters.map((f) => {
            const qs = new URLSearchParams();
            if (q) qs.set("q", q);
            if (f.value) qs.set("status", f.value);
            const active = (f.value ?? undefined) === status;
            return (
              <li key={f.label}>
                <Link
                  href={`/admin/products${qs.size ? `?${qs}` : ""}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm font-semibold",
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-leaf-900",
                  )}
                >
                  {f.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </form>

      {shown.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          {products.length === 0 ? t("products.empty") : t("products.noMatch")}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-card border border-border bg-background">
          {shown.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/products/${p.id}`}
                className="flex items-center gap-4 p-3 transition-colors hover:bg-leaf-50 sm:p-4"
              >
                <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-leaf-50 text-leaf-300">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                    <img
                      src={p.imageUrl}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <LeafIcon className="size-6" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-leaf-900">
                    {p.name ?? t("products.noName")}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                    {p.categoryLabel ?? t("products.noCategory")} ·{" "}
                    {t("products.photos", { count: p.imageCount })} ·{" "}
                    {t("products.sizes", { count: p.variantCount })}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      STATUS_STYLES[p.status],
                    )}
                  >
                    {t(`status.${p.status}`)}
                  </span>
                  {p.isFeatured && (
                    <span className="rounded-full bg-gold-300 px-2.5 py-1 text-xs font-semibold text-leaf-950">
                      ★
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
