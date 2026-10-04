import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <main id="main" className="flex flex-1 items-center">
      <Section className="w-full text-center">
        <h1 className="text-3xl font-semibold text-leaf-900">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("description")}</p>
        <Link href="/" className={buttonStyles({ className: "mt-8" })}>
          {t("backHome")}
        </Link>
      </Section>
    </main>
  );
}
