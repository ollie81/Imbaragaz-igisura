import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";

import { ArrowRightIcon, LeafIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { productPath } from "@/lib/utils/product-paths";
import type { ProductSummary, ProductVariantSummary } from "@/server/products";

const UNIT_KEYS = ["ml", "l", "g", "kg", "piece", "pack"] as const;
type UnitKey = (typeof UNIT_KEYS)[number];

function isUnitKey(unit: string | null): unit is UnitKey {
  return unit !== null && (UNIT_KEYS as readonly string[]).includes(unit);
}

type ProductCardProps = {
  product: ProductSummary;
  /** Set on cards visible on first load (e.g. the first row) to load their image eagerly. */
  priority?: boolean;
  headingLevel?: "h2" | "h3";
};

/**
 * Product card used on the home page and (later) the Products page.
 * Every value comes from the database; missing values are simply not shown.
 */
export async function ProductCard({ product, priority, headingLevel = "h3" }: ProductCardProps) {
  const [t, format] = await Promise.all([getTranslations("product"), getFormatter()]);
  const Heading = headingLevel;
  const variant = product.primaryVariant;

  const size = (v: ProductVariantSummary) => {
    if (v.label) return v.label;
    if (v.sizeValue == null || !isUnitKey(v.sizeUnit)) return null;
    return `${format.number(v.sizeValue)} ${t(`units.${v.sizeUnit}`)}`;
  };

  const price =
    variant?.price != null
      ? format.number(variant.price, {
          style: "currency",
          currency: variant.currency,
          maximumFractionDigits: variant.currency === "RWF" ? 0 : 2,
        })
      : null;

  const sizeText = variant ? size(variant) : null;
  const unavailable = product.availability === "out_of_stock";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-background shadow-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-leaf-50">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          // Neutral placeholder until the business uploads a real photo.
          <div className="grid h-full place-items-center text-leaf-300" aria-hidden="true">
            <LeafIcon className="size-14" />
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 rounded-full bg-gold-300 px-3 py-1 text-xs font-semibold text-leaf-950 shadow-sm">
            {t("featured")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Heading className="text-xl leading-snug font-semibold text-leaf-900">
          {product.name}
        </Heading>
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-muted-foreground">{product.shortDescription}</p>
        )}

        <dl className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {sizeText && (
            <div>
              <dt className="sr-only">{t("sizeLabel")}</dt>
              <dd className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-leaf-800">
                {sizeText}
                {product.variantCount > 1 && (
                  <span className="text-muted-foreground">
                    {" "}
                    {t("moreSizes", { count: product.variantCount - 1 })}
                  </span>
                )}
              </dd>
            </div>
          )}
          <div>
            <dt className="sr-only">{t("availabilityLabel")}</dt>
            <dd className={cn("font-medium", unavailable ? "text-gold-800" : "text-leaf-600")}>
              {t(`availability.${product.availability}`)}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="text-lg font-semibold text-leaf-900">{price ?? t("priceOnRequest")}</p>
          <Link
            href={productPath(product.slug)}
            aria-label={t("viewDetailsOf", { name: product.name })}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 font-semibold text-primary after:absolute after:inset-0 after:content-[''] hover:text-primary-hover"
          >
            {t("viewDetails")}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
