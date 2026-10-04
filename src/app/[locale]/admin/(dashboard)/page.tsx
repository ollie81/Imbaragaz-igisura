import { getTranslations } from "next-intl/server";

import type { AppLocale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: AppLocale };
  await requireAdmin(locale);
  const t = await getTranslations("admin.dashboard");

  return (
    <>
      <h1 className="text-2xl font-semibold text-leaf-900">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("intro")}</p>
    </>
  );
}
