import type { getFormatter, getTranslations } from "next-intl/server";

import type { ProductVariantSummary } from "@/server/products";

type Formatter = Awaited<ReturnType<typeof getFormatter>>;
type ProductT = Awaited<ReturnType<typeof getTranslations<"product">>>;

const UNIT_KEYS = ["ml", "l", "g", "kg", "piece", "pack"] as const;
type UnitKey = (typeof UNIT_KEYS)[number];

function isUnitKey(unit: string | null): unit is UnitKey {
  return unit !== null && (UNIT_KEYS as readonly string[]).includes(unit);
}

/** "250 ml", or the variant's own label; null when no size is confirmed. */
export function formatVariantSize(
  variant: Pick<ProductVariantSummary, "label" | "sizeValue" | "sizeUnit">,
  format: Formatter,
  t: ProductT,
): string | null {
  if (variant.label) return variant.label;
  if (variant.sizeValue == null || !isUnitKey(variant.sizeUnit)) return null;
  return `${format.number(variant.sizeValue)} ${t(`units.${variant.sizeUnit}`)}`;
}

/** Localised price, e.g. "RWF 5,000" (en) or "RF 5.000" (rw). */
export function formatPrice(format: Formatter, price: number, currency: string): string {
  return format.number(price, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "RWF" ? 0 : 2,
  });
}
