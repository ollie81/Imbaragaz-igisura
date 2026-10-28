import { getTranslations } from "next-intl/server";

import { LocationPhotosManager } from "@/components/admin/location-photos-manager";
import { ShopPhotoManager } from "@/components/admin/shop-photo-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { getBusinessInfo } from "@/server/business";
import { listAdminLocationPhotos } from "@/server/location-photos";

export default async function AdminShopPhotoPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  // Business-wide settings: owners and managers only (the database enforces the same).
  await requireAdmin(locale, ["owner", "manager"]);
  const [t, tl, business, locationPhotos] = await Promise.all([
    getTranslations("admin.shopPhoto"),
    getTranslations("admin.locationPhotos"),
    getBusinessInfo(locale),
    listAdminLocationPhotos(),
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

      <section id="location" className="mt-12 scroll-mt-4 border-t border-border pt-10">
        <h2 className="text-2xl font-semibold text-leaf-900">{tl("title")}</h2>
        <p className="mt-2 mb-6 text-muted-foreground">{tl("intro")}</p>
        <LocationPhotosManager
          photos={locationPhotos.map((p) => ({ id: p.id, url: p.url, captions: p.captions }))}
        />
      </section>
    </div>
  );
}
