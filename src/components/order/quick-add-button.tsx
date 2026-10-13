"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

import { addToOrderList, type NewOrderItem } from "./order-list-store";

/** Round "+" on a product card: adds one of the product to the order list. */
export function QuickAddButton({ item }: { item: NewOrderItem }) {
  const t = useTranslations("orderList");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        addToOrderList(item, 1);
        setAdded(true);
      }}
      aria-label={t("addAria", { name: item.name })}
      title={t("add")}
      // Sits above the card-wide link so it stays separately clickable.
      className={cn(
        "relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors",
        added
          ? "border-leaf-700 bg-leaf-700 text-white"
          : "border-border bg-background text-leaf-900 hover:bg-muted",
      )}
    >
      {added ? <CheckIcon className="size-5" /> : <PlusIcon className="size-5" />}
      <span role="status" className="sr-only">
        {added ? t("added") : ""}
      </span>
    </button>
  );
}
