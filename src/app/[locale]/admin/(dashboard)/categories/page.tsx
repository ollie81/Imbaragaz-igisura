import { getTranslations } from "next-intl/server";

import { CategoriesManager } from "@/components/admin/categories-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { listAdminCategories } from "@/server/admin/catalog";

export default async function AdminCategoriesPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale);
  const [t, categories] = await Promise.all([
    getTranslations("admin.categories"),
    listAdminCategories(locale),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold text-leaf-900">{t("title")}</h1>
      <p className="mt-2 mb-6 text-muted-foreground">{t("intro")}</p>
      <CategoriesManager
        categories={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          isActive: c.isActive,
          names: c.names,
          productCount: c.productCount,
        }))}
      />
    </div>
  );
}
