"use client";

import { useLocale } from "next-intl";

import { localeMeta, locales } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type LocaleSwitcherProps = {
  label: string;
  tone?: "default" | "inverse";
};

/** Links to the current page in every supported language. */
export function LocaleSwitcher({ label, tone = "default" }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const current = useLocale();
  const inverse = tone === "inverse";

  return (
    <nav aria-label={label}>
      <ul
        className={cn(
          "flex items-center gap-0.5 rounded-full border p-1 text-sm",
          inverse ? "border-leaf-700" : "border-border bg-background",
        )}
      >
        {locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? "true" : undefined}
                title={localeMeta[locale].nativeName}
                className={cn(
                  "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-2.5 font-semibold uppercase transition-colors",
                  active && (inverse ? "bg-gold-400 text-leaf-950" : "bg-primary text-white"),
                  !active &&
                    (inverse
                      ? "text-leaf-100 hover:bg-leaf-800"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"),
                )}
              >
                <span className="sr-only">{localeMeta[locale].nativeName}</span>
                <span aria-hidden="true">{locale}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
