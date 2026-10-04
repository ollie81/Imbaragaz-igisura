import { getTranslations, setRequestLocale } from "next-intl/server";

import { Card } from "@/components/ui/card";
import type { AppLocale } from "@/i18n/config";

// Placeholder: the sign-in method (email + password, magic link, …) is still
// to be decided. Nothing here grants access; see src/lib/auth/admin.ts.
export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: AppLocale };
  setRequestLocale(locale);
  const t = await getTranslations("admin.login");

  return (
    <main id="main" className="grid flex-1 place-items-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-leaf-900">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("notConfigured")}</p>
      </Card>
    </main>
  );
}
