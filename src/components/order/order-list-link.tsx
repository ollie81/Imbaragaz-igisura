"use client";

import { useTranslations } from "next-intl";

import { ListIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

import { useOrderList } from "./order-list-store";

/** Header button to the order list, with the number of products in it. */
export function OrderListLink() {
  const t = useTranslations("orderList");
  const count = useOrderList().length;

  return (
    <Link
      href="/order-list"
      aria-label={count > 0 ? `${t("title")}: ${t("count", { count })}` : t("title")}
      title={t("title")}
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-leaf-900 transition-colors hover:bg-muted"
    >
      <ListIcon className="size-5" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-xs leading-5 font-bold text-leaf-950"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
