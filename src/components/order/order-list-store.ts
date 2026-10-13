"use client";

import { useSyncExternalStore } from "react";

/**
 * The visitor's order list, kept only in their own browser (localStorage).
 * Nothing is sent to our server: the list is turned into a WhatsApp message
 * that the visitor sends to the business themselves.
 */

export type OrderItem = {
  /** Product slug + size, so the same size is never listed twice. */
  key: string;
  slug: string;
  name: string;
  /** Size as shown on the site when it was added, e.g. "250 ml". */
  sizeText: string | null;
  price: number | null;
  currency: string | null;
  quantity: number;
};

export type NewOrderItem = Omit<OrderItem, "key" | "quantity"> & { variantId: string | null };

const STORAGE_KEY = "imbaraga-order-list-v1";
const MAX_ITEMS = 100;
export const MAX_QUANTITY = 999;
const EMPTY: OrderItem[] = [];

const listeners = new Set<() => void>();
let memory: OrderItem[] = EMPTY;
let lastRaw: string | null | undefined;
// Private browsing or blocked storage: keep the list in memory for this visit.
let storageWorks = true;

const clampQuantity = (n: number) =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.round(Number.isFinite(n) ? n : 1)));

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

function parse(raw: string | null): OrderItem[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    const items: OrderItem[] = [];
    for (const entry of data.slice(0, MAX_ITEMS)) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      const key = text(e.key, 200);
      const slug = text(e.slug, 100);
      const name = text(e.name, 200);
      if (!key || !slug || !name) continue;
      items.push({
        key,
        slug,
        name,
        sizeText: text(e.sizeText, 100),
        price: typeof e.price === "number" && Number.isFinite(e.price) ? e.price : null,
        currency: text(e.currency, 3),
        quantity: clampQuantity(Number(e.quantity)),
      });
    }
    return items;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): OrderItem[] {
  if (!storageWorks) return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== lastRaw) {
      lastRaw = raw;
      memory = parse(raw);
    }
  } catch {
    storageWorks = false;
  }
  return memory;
}

const getServerSnapshot = () => EMPTY;

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps several open tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function save(items: OrderItem[]) {
  memory = items;
  if (storageWorks) {
    try {
      const raw = JSON.stringify(items);
      window.localStorage.setItem(STORAGE_KEY, raw);
      lastRaw = raw;
    } catch {
      storageWorks = false;
    }
  }
  listeners.forEach((listener) => listener());
}

export function useOrderList(): OrderItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function addToOrderList(item: NewOrderItem, quantity = 1) {
  const key = `${item.slug}:${item.variantId ?? ""}`;
  const items = getSnapshot();
  const existing = items.find((i) => i.key === key);
  if (existing) {
    save(
      items.map((i) =>
        i.key === key
          ? // Refresh name/price in case they changed since it was first added.
            { ...i, ...withoutVariant(item), quantity: clampQuantity(i.quantity + quantity) }
          : i,
      ),
    );
    return;
  }
  if (items.length >= MAX_ITEMS) return;
  save([...items, { ...withoutVariant(item), key, quantity: clampQuantity(quantity) }]);
}

function withoutVariant(item: NewOrderItem): Omit<OrderItem, "key" | "quantity"> {
  return {
    slug: item.slug,
    name: item.name,
    sizeText: item.sizeText,
    price: item.price,
    currency: item.currency,
  };
}

export function setOrderQuantity(key: string, quantity: number) {
  save(getSnapshot().map((i) => (i.key === key ? { ...i, quantity: clampQuantity(quantity) } : i)));
}

export function removeFromOrderList(key: string) {
  save(getSnapshot().filter((i) => i.key !== key));
}

export function clearOrderList() {
  save(EMPTY);
}
