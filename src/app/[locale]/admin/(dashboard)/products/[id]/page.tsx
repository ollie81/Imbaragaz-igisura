import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SubmitButton } from "@/components/admin/fields";
import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { VariantsEditor } from "@/components/admin/variants-editor";
import { buttonStyles } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { pickTranslation } from "@/lib/i18n/content";
import { resolveLocale } from "@/lib/i18n/params";
import { productPath } from "@/lib/utils/product-paths";
import { getOpenAiApiKey } from "@/config/server-env";
import { getAdminProduct, listAdminCategories } from "@/server/admin/catalog";
import { deleteProductAction } from "@/server/admin/product-actions";
import { UUID_PATTERN } from "@/server/admin/validation";

// Allows time for the "Write a draft with AI" server action.
export const maxDuration = 120;

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const locale = await resolveLocale(params);
  await requireAdmin(locale);
  if (!UUID_PATTERN.test(id)) notFound();

  const [t, product, categories] = await Promise.all([
    getTranslations("admin"),
    getAdminProduct(id),
    listAdminCategories(locale),
  ]);
  if (!product) notFound();

  const name = pickTranslation(
    Object.values(product.translations).filter(Boolean) as { locale: string; name: string }[],
    locale,
  )?.name;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/products" className="text-sm font-semibold text-primary hover:underline">
          ← {t("productForm.back")}
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-leaf-900">
            {name ?? t("productForm.editTitle")}
          </h1>
          {product.status === "published" && (
            <Link
              href={productPath(product.slug)}
              target="_blank"
              className={buttonStyles({ variant: "outline" })}
            >
              {t("productForm.viewOnSite")}
            </Link>
          )}
        </div>
      </div>

      <ProductForm
        product={{
          id: product.id,
          slug: product.slug,
          status: product.status,
          categoryId: product.category_id,
          availability: product.availability,
          isFeatured: product.is_featured,
          displayOrder: product.display_order,
          translations: {
            rw: product.translations.rw ?? undefined,
            en: product.translations.en ?? undefined,
          },
        }}
        categories={categories.map((c) => ({ id: c.id, label: c.label }))}
        aiEnabled={Boolean(getOpenAiApiKey())}
      />

      <ImageManager
        productId={product.id}
        images={product.images.map((i) => ({
          id: i.id,
          url: i.url,
          isPrimary: i.is_primary,
          alts: i.alts,
        }))}
      />

      <VariantsEditor
        productId={product.id}
        variants={product.variants.map((v) => ({
          id: v.id,
          label: v.label,
          sizeValue: v.size_value,
          sizeUnit: v.size_unit,
          price: v.price,
          currency: v.currency,
          isAvailable: v.is_available,
          isDefault: v.is_default,
          displayOrder: v.display_order,
        }))}
      />

      <section className="rounded-card border border-red-200 bg-red-50/50 p-5 sm:p-6">
        <h2 className="font-sans text-lg font-semibold text-red-900">
          {t("productForm.dangerZone")}
        </h2>
        <p className="mt-1 text-sm text-red-900/80">{t("productForm.deleteText")}</p>
        <form action={deleteProductAction} className="mt-4">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="locale" value={locale} />
          <SubmitButton
            label={t("productForm.delete")}
            variant="outline"
            confirm={t("productForm.deleteConfirm")}
            className="border-red-300 text-red-800"
          />
        </form>
      </section>
    </div>
  );
}
