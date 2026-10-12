import { getTranslations } from "next-intl/server";

import { NewProductForm } from "@/components/admin/product-form";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { listAdminCategories } from "@/server/admin/catalog";

export default async function NewProductPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale);
  const [t, categories] = await Promise.all([
    getTranslations("admin.productForm"),
    listAdminCategories(locale),
  ]);

  return (
    <div className="max-w-xl">
      <Link href="/admin/products" className="text-sm font-semibold text-primary hover:underline">
        ← {t("back")}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-leaf-900">{t("createTitle")}</h1>
      <p className="mt-2 mb-6 text-muted-foreground">{t("createIntro")}</p>
      <div className="rounded-card border border-border bg-background p-5 sm:p-6">
        <NewProductForm
          locale={locale}
          categories={categories.map((c) => ({ id: c.id, label: c.label }))}
        />
      </div>
    </div>
  );
}
