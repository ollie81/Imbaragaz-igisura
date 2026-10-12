"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type AdminNavProps = { items: { href: string; label: string }[]; label: string };

/** Admin section links; highlights the current section. */
export function AdminNav({ items, label }: AdminNavProps) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1">
        {items.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  active ? "bg-primary text-white" : "text-leaf-900 hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
