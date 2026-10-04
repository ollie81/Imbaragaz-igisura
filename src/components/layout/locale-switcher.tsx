"use client";

import { useLocale } from "next-intl";

import { localeMeta, locales } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/** Links to the current page in every supported language. */
export function LocaleSwitcher({ label }: { label: string }) {
  const pathname = usePathname();
  const current = useLocale();

  return (
    <nav aria-label={label}>
      <ul className="flex items-center gap-1 rounded-full border border-border p-1 text-sm">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? "true" : undefined}
              className={cn(
                "inline-flex min-h-9 min-w-11 items-center justify-center rounded-full px-3 font-semibold uppercase transition-colors",
                locale === current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <abbr title={localeMeta[locale].nativeName} className="no-underline">
                {locale}
              </abbr>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
