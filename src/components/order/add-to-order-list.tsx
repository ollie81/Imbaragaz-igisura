"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { CheckIcon, ListIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

import { addToOrderList, MAX_QUANTITY } from "./order-list-store";

export type OrderOption = {
  variantId: string | null;
  sizeText: string | null;
  price: number | null;
  currency: string | null;
  /** Formatted price for the size picker, e.g. "RF 5.000". */
  priceText: string | null;
};

/** Size, quantity and "Add to my list" on a product page. */
export function AddToOrderList({
  slug,
  name,
  options,
}: {
  slug: string;
  name: string;
  options: OrderOption[];
}) {
  const t = useTranslations("orderList");
  const id = useId();
  const [optionIndex, setOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const option = options[optionIndex] ?? options[0];
  if (!option) return null;

  const change = (next: number) => {
    setQuantity(Math.min(MAX_QUANTITY, Math.max(1, next)));
    setAdded(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        {options.length > 1 && (
          <label className="min-w-0 flex-1 basis-48">
            <span className="mb-1 block text-sm font-medium text-leaf-900">{t("size")}</span>
            <select
              value={optionIndex}
              onChange={(e) => {
                setOptionIndex(Number(e.target.value));
                setAdded(false);
              }}
              className="block min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base"
            >
              {options.map((o, i) => (
                <option key={o.variantId ?? i} value={i}>
                  {[o.sizeText, o.priceText].filter(Boolean).join(" · ")}
                </option>
              ))}
            </select>
          </label>
        )}
        <div>
          <span id={`${id}-qty`} className="mb-1 block text-sm font-medium text-leaf-900">
            {t("quantity")}
          </span>
          <div
            role="group"
            aria-labelledby={`${id}-qty`}
            className="inline-flex items-center rounded-full border border-border bg-background"
          >
            <button
              type="button"
              onClick={() => change(quantity - 1)}
              disabled={quantity <= 1}
              aria-label={t("decrease", { name })}
              className="grid size-11 place-items-center rounded-full text-leaf-900 disabled:opacity-40"
            >
              <MinusIcon className="size-4" />
            </button>
            <span aria-live="polite" className="min-w-8 text-center font-semibold tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => change(quantity + 1)}
              disabled={quantity >= MAX_QUANTITY}
              aria-label={t("increase", { name })}
              className="grid size-11 place-items-center rounded-full text-leaf-900 disabled:opacity-40"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          addToOrderList(
            {
              slug,
              name,
              variantId: option.variantId,
              sizeText: option.sizeText,
              price: option.price,
              currency: option.currency,
            },
            quantity,
          );
          setAdded(true);
        }}
        className={cn(buttonStyles({ variant: "primary", size: "xl" }), "w-full")}
      >
        {added ? <CheckIcon /> : <ListIcon />}
        {added ? t("addedShort") : t("add")}
      </button>

      <p role="status" aria-live="polite" className="text-sm text-leaf-900 empty:hidden">
        {added && (
          <>
            {t("added")}{" "}
            <Link href="/order-list" className="font-semibold text-primary underline">
              {t("view")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
