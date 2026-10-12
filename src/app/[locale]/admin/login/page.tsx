import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/components/admin/login-form";
import { BrandLink } from "@/components/layout/brand-link";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/config/env";
import { businessDefaults } from "@/config/business-defaults";
import { redirect } from "@/i18n/navigation";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";

/**
 * Administrator sign-in (email + password via Supabase Auth). There is no
 * public sign-up: accounts are created by the project owner in Supabase and
 * granted access by adding them to public.admins.
 */
export default async function AdminLoginPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  if (await getCurrentAdmin()) redirect({ href: "/admin", locale });
  const t = await getTranslations("admin.login");

  return (
    <main id="main" className="grid flex-1 place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandLink name={businessDefaults.name} />
        </div>
        <Card>
          <h1 className="text-2xl font-semibold text-leaf-900">{t("title")}</h1>
          {isSupabaseConfigured ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">{t("intro")}</p>
              <LoginForm locale={locale} />
            </>
          ) : (
            <p className="mt-3 text-muted-foreground">{t("notConfigured")}</p>
          )}
        </Card>
      </div>
    </main>
  );
}
