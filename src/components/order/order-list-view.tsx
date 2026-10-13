"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { ChatIcon, ListIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { whatsappHref } from "@/lib/utils/phone";
import { productPath } from "@/lib/utils/product-paths";

import {
  clearOrderList,
  MAX_QUANTITY,
  removeFromOrderList,
  setOrderQuantity,
  useOrderList,
  type OrderItem,
} from "./order-list-store";

type WhatsappNumber = { e164: string; display: string };

/**
 * The order list page: change amounts, remove items, then send the whole
 * list to the business as one WhatsApp message. No payment, no account.
 */
export function OrderListView({
  businessName,
  whatsapp,
}: {
  businessName: string;
  whatsapp: WhatsappNumber[];
}) {
  const t = useTranslations("orderList");
  const format = useFormatter();
  const items = useOrderList();
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");

  const money = (amount: number, currency: string) =>
    format.number(amount, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "RWF" ? 0 : 2,
    });

  // A total is shown only when every line has a price in the same currency.
  const currencies = new Set(items.map((i) => i.currency));
  const allPriced = items.length > 0 && items.every((i) => i.price != null && i.currency);
  const total =
    allPriced && currencies.size === 1
      ? money(
          items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0),
          items[0].currency as string,
        )
      : null;

  const lineText = (i: OrderItem) =>
    `• ${i.quantity} × ${i.name}${i.sizeText ? ` (${i.sizeText})` : ""}${
      i.price != null && i.currency ? ` – ${money(i.price, i.currency)}` : ""
    }`;

  const message = [
    t("messageIntro", { business: businessName }),
    "",
    ...items.map(lineText),
    ...(total ? ["", t("messageTotal", { total })] : []),
    ...(customerName.trim() ? ["", t("messageName", { name: customerName.trim() })] : []),
    ...(note.trim() ? [t("messageNote", { note: note.trim() })] : []),
  ].join("\n");

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-border bg-background p-8 text-center">
        <ListIcon className="mx-auto size-10 text-leaf-300" />
        <h2 className="mt-4 text-2xl font-semibold text-leaf-900">{t("empty")}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">{t("emptyText")}</p>
        <Link
          href="/products"
          className={buttonStyles({ variant: "primary", size: "lg", className: "mt-6" })}
        >
          {t("browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <section aria-labelledby="order-items-title">
        <h2 id="order-items-title" className="sr-only">
          {t("itemsTitle")}
        </h2>
        <ul className="divide-y divide-border rounded-card border border-border bg-background">
          {items.map((item) => (
            <li key={item.key} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:p-5">
              <div className="min-w-0 flex-1 basis-48">
                <Link
                  href={productPath(item.slug)}
                  className="font-semibold text-leaf-900 hover:text-primary hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {[
                    item.sizeText,
                    item.price != null && item.currency
                      ? money(item.price, item.currency)
                      : t("priceOnRequest"),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div
                role="group"
                aria-label={`${t("quantity")}: ${item.name}`}
                className="inline-flex items-center rounded-full border border-border"
              >
                <button
                  type="button"
                  onClick={() => setOrderQuantity(item.key, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  aria-label={t("decrease", { name: item.name })}
                  className="grid size-11 place-items-center rounded-full disabled:opacity-40"
                >
                  <MinusIcon className="size-4" />
                </button>
                <span className="min-w-8 text-center font-semibold tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderQuantity(item.key, item.quantity + 1)}
                  disabled={item.quantity >= MAX_QUANTITY}
                  aria-label={t("increase", { name: item.name })}
                  className="grid size-11 place-items-center rounded-full disabled:opacity-40"
                >
                  <PlusIcon className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeFromOrderList(item.key)}
                aria-label={t("removeAria", { name: item.name })}
                title={t("remove")}
                className="grid size-11 place-items-center rounded-full text-red-800 hover:bg-red-50"
              >
                <TrashIcon className="size-5" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("clearConfirm"))) clearOrderList();
          }}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-red-800 hover:bg-red-50"
        >
          <TrashIcon className="size-4" />
          {t("clear")}
        </button>
      </section>

      <section
        aria-labelledby="order-send-title"
        className="space-y-5 rounded-card border border-gold-200 bg-accent-soft p-5 sm:p-6"
      >
        <h2 id="order-send-title" className="font-sans text-lg font-semibold text-leaf-900">
          {t("sendTitle")}
        </h2>

        <div>
          {total ? (
            <p className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-leaf-900">{t("estimatedTotal")}</span>
              <span className="text-2xl font-semibold text-leaf-900">{total}</span>
            </p>
          ) : (
            <p className="text-sm text-leaf-900">{t("someOnRequest")}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{t("totalNote")}</p>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-leaf-900">{t("yourName")}</span>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            maxLength={80}
            autoComplete="name"
            className="block min-h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-leaf-900">{t("note")}</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t("notePlaceholder")}
            className="block w-full rounded-xl border border-border bg-background px-3.5 py-2 text-base"
          />
        </label>

        {whatsapp.length > 0 ? (
          <div className="space-y-3">
            <a
              href={whatsappHref(whatsapp[0].e164, message)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "accent", size: "xl", className: "w-full" })}
            >
              <ChatIcon />
              {t("send")}
              <span className="sr-only"> {t("opensInNewTab")}</span>
            </a>
            {whatsapp.slice(1).map((w) => (
              <a
                key={w.e164}
                href={whatsappHref(w.e164, message)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "outline", size: "lg", className: "w-full" })}
              >
                <ChatIcon />
                {t("sendTo", { number: w.display })}
                <span className="sr-only"> {t("opensInNewTab")}</span>
              </a>
            ))}
            <p className="text-sm text-muted-foreground">{t("sendHelp")}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
