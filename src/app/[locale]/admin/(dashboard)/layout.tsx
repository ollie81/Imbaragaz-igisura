import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/container";
import type { AppLocale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/admin";

// Every protected admin route lives in this group. The layout check gives a
// fast redirect; pages and Server Actions must ALSO call requireAdmin(), and
// the database enforces permissions with RLS regardless.
export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: AppLocale };
  const admin = await requireAdmin(locale);
  const t = await getTranslations("admin");

  return (
    <>
      <header className="border-b border-border bg-background">
        <Container className="flex h-14 items-center justify-between">
          <span className="font-display font-semibold text-primary">{t("title")}</span>
          <span className="text-sm text-muted-foreground">
            {t("signedInAs", { name: admin.fullName })}
          </span>
        </Container>
      </header>
      <main id="main" className="flex-1 py-8">
        <Container>{children}</Container>
      </main>
    </>
  );
}
