import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { getDashboardStats } from "@/server/admin/catalog";

export default async function AdminDashboardPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale);
  const [t, stats] = await Promise.all([getTranslations("admin"), getDashboardStats()]);

  const tiles = [
    { label: t("dashboard.published"), value: stats.published },
    { label: t("dashboard.drafts"), value: stats.drafts },
    { label: t("dashboard.categories"), value: stats.categories },
  ];

  return (
    <>
      <h1 className="text-3xl font-semibold text-leaf-900">{t("dashboard.title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("dashboard.intro")}</p>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-card border border-border bg-background p-4">
            <dt className="text-sm text-muted-foreground">{tile.label}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold text-leaf-900">{tile.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className={buttonStyles({ size: "lg" })}>
          {t("dashboard.addProduct")}
        </Link>
        <Link href="/admin/products" className={buttonStyles({ variant: "outline", size: "lg" })}>
          {t("dashboard.manageProducts")}
        </Link>
        <Link href="/admin/categories" className={buttonStyles({ variant: "outline", size: "lg" })}>
          {t("dashboard.manageCategories")}
        </Link>
      </div>

      <section className="mt-10 max-w-2xl rounded-card border border-border bg-background p-6">
        <h2 className="font-sans text-lg font-semibold text-leaf-900">
          {t("dashboard.howToTitle")}
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>{t("dashboard.howTo1")}</li>
          <li>{t("dashboard.howTo2")}</li>
          <li>{t("dashboard.howTo3")}</li>
          <li>{t("dashboard.howTo4")}</li>
        </ol>
      </section>
    </>
  );
}
