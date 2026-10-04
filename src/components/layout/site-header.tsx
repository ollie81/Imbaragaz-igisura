import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/container";
import { LeafIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";

export async function SiteHeader({ businessName }: { businessName: string }) {
  const t = await getTranslations("common");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold text-primary"
        >
          <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
            <LeafIcon className="size-5" />
          </span>
          <span>{businessName}</span>
        </Link>
        <LocaleSwitcher label={t("language")} />
      </Container>
    </header>
  );
}
