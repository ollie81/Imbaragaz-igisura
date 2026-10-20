import { getTranslations } from "next-intl/server";

import { ShopPhotoManager } from "@/components/admin/shop-photo-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { getBusinessInfo } from "@/server/business";

export default async function AdminShopPhotoPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  // Business-wide settings: owners and managers only (the database enforces the same).
  await requireAdmin(locale, ["owner", "manager"]);
  const [t, business] = await Promise.all([
    getTranslations("admin.shopPhoto"),
    getBusinessInfo(locale),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold text-leaf-900">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("intro")}</p>
      <ul className="mt-4 mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>{t("tip1")}</li>
        <li>{t("tip2")}</li>
        <li>{t("tip3")}</li>
      </ul>
      <ShopPhotoManager photoUrl={business.shopPhoto?.url ?? null} />
    </div>
  );
}
