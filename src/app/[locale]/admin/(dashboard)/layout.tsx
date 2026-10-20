import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { AdminNav } from "@/components/admin/admin-nav";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { signOutAction } from "@/server/admin/auth-actions";

// Every protected admin route lives in this group. The layout check gives a
// fast redirect; pages and Server Actions ALSO check, and the database
// enforces permissions with RLS regardless.
export default async function AdminDashboardLayout({
  children,
  params,
}: LocaleParams & { children: ReactNode }) {
  const locale = await resolveLocale(params);
  const admin = await requireAdmin(locale);
  const t = await getTranslations("admin");

  return (
    <>
      <header className="border-b border-border bg-background">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <p className="font-display text-lg font-semibold text-primary">{t("title")}</p>
            <p className="text-xs text-muted-foreground">
              {t("signedInAs", { name: admin.fullName })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className={buttonStyles({ variant: "ghost" })}>
              {t("viewSite")}
            </Link>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className={buttonStyles({ variant: "outline" })}>
                {t("signOut")}
              </button>
            </form>
          </div>
        </Container>
        <Container className="pb-2">
          <AdminNav
            label={t("title")}
            items={[
              { href: "/admin", label: t("nav.dashboard") },
              { href: "/admin/products", label: t("nav.products") },
              { href: "/admin/categories", label: t("nav.categories") },
              ...(admin.role === "owner" || admin.role === "manager"
                ? [{ href: "/admin/shop-photo", label: t("nav.shopPhoto") }]
                : []),
            ]}
          />
        </Container>
      </header>
      <main id="main" className="flex-1 py-8">
        <Container>{children}</Container>
      </main>
    </>
  );
}
