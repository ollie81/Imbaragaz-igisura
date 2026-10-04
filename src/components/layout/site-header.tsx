import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ChatIcon } from "@/components/ui/icons";
import { mainNavigation } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import type { ContactLinks } from "@/lib/business/contact-links";

import { BrandLink } from "./brand-link";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileMenu } from "./mobile-menu";

type SiteHeaderProps = {
  businessName: string;
  contacts: ContactLinks;
};

export async function SiteHeader({ businessName, contacts }: SiteHeaderProps) {
  const t = await getTranslations();
  const items = mainNavigation.map((item) => ({ href: item.href, label: t(`nav.${item.key}`) }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <Container className="relative flex h-16 items-center justify-between gap-3 lg:h-[4.5rem]">
        <BrandLink name={businessName} />

        <nav aria-label={t("nav.label")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 font-medium text-leaf-900 transition-colors hover:bg-muted hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher label={t("common.language")} />
          {contacts.whatsapp && (
            <span className="hidden md:block">
              <a
                href={contacts.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "accent" })}
              >
                <ChatIcon />
                {t("common.whatsapp")}
                <span className="sr-only"> {t("common.opensInNewTab")}</span>
              </a>
            </span>
          )}
          <MobileMenu
            className="lg:hidden"
            items={items}
            whatsappHref={contacts.whatsapp?.href ?? null}
            callHref={contacts.phones[0]?.href ?? null}
            labels={{
              open: t("nav.openMenu"),
              close: t("nav.closeMenu"),
              menu: t("nav.label"),
              whatsapp: t("common.whatsapp"),
              call: t("common.callUs"),
            }}
          />
        </div>
      </Container>
    </header>
  );
}
