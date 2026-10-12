"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { createProductAction, updateProductAction } from "@/server/admin/product-actions";
import { idleState } from "@/server/admin/form";

import {
  Field,
  FormMessage,
  inputClass,
  SubmitButton,
  textareaClass,
  useFieldError,
} from "./fields";

type CategoryOption = { id: string; label: string };
type Translation = Partial<Record<string, string | null>>;

export type ProductFormValues = {
  id: string;
  slug: string;
  status: string;
  categoryId: string | null;
  availability: string | null;
  isFeatured: boolean;
  displayOrder: number;
  translations: Partial<Record<"rw" | "en", Translation>>;
};

const CONTENT_LOCALES = ["rw", "en"] as const;

const TEXT_FIELDS = [
  { name: "short_description", label: "shortDescription", help: "shortDescriptionHelp", rows: 2 },
  { name: "description", label: "description", rows: 5 },
  { name: "traditional_use", label: "traditionalUse", help: "traditionalUseHelp", rows: 4 },
  { name: "usage_instructions", label: "usage", rows: 3 },
  { name: "ingredients", label: "ingredients", help: "ingredientsHelp", rows: 2 },
  { name: "warnings", label: "warnings", rows: 3 },
  { name: "storage_instructions", label: "storage", rows: 2 },
] as const;

/** First step: just the name(s) and category. */
export function NewProductForm({
  locale,
  categories,
}: {
  locale: string;
  categories: CategoryOption[];
}) {
  const t = useTranslations("admin.productForm");
  const [state, action] = useActionState(createProductAction, idleState);
  const fieldError = useFieldError(state);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <FormMessage state={state} />
      {CONTENT_LOCALES.map((l) => (
        <Field
          key={l}
          id={`name_${l}`}
          label={`${t("name")} (${t(`language.${l}`)})`}
          error={fieldError(`name_${l}`)}
        >
          <input
            id={`name_${l}`}
            name={`name_${l}`}
            maxLength={200}
            lang={l}
            className={inputClass}
            aria-invalid={Boolean(fieldError(`name_${l}`))}
          />
        </Field>
      ))}
      <Field id="category_id" label={t("category")}>
        <select id="category_id" name="category_id" className={inputClass} defaultValue="">
          <option value="">{t("noCategory")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <SubmitButton label={t("create")} pendingLabel={t("creating")} />
    </form>
  );
}

/** Full editor for an existing product. */
export function ProductForm({
  product,
  categories,
}: {
  product: ProductFormValues;
  categories: CategoryOption[];
}) {
  const t = useTranslations("admin");
  const [state, action] = useActionState(updateProductAction, idleState);
  const fieldError = useFieldError(state);
  const value = (l: "rw" | "en", field: string) => product.translations[l]?.[field] ?? "";

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="id" value={product.id} />

      <section className="rounded-card border border-border bg-background p-5 sm:p-6">
        <h2 className="font-sans text-lg font-semibold text-leaf-900">
          {t("productForm.detailsSection")}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field id="status" label={t("productForm.status")} help={t("productForm.statusHelp")}>
            <select id="status" name="status" defaultValue={product.status} className={inputClass}>
              {(["draft", "published", "archived"] as const).map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field id="category_id" label={t("productForm.category")}>
            <select
              id="category_id"
              name="category_id"
              defaultValue={product.categoryId ?? ""}
              className={inputClass}
            >
              <option value="">{t("productForm.noCategory")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="availability"
            label={t("productForm.availability")}
            help={t("productForm.availabilityHelp")}
          >
            <select
              id="availability"
              name="availability"
              defaultValue={product.availability ?? ""}
              className={inputClass}
            >
              <option value="">{t("productForm.availabilityNone")}</option>
              {(["in_stock", "low_stock", "out_of_stock", "on_request"] as const).map((a) => (
                <option key={a} value={a}>
                  {t(`availabilityOptions.${a}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="display_order"
            label={t("productForm.displayOrder")}
            help={t("productForm.displayOrderHelp")}
            error={fieldError("display_order")}
          >
            <input
              id="display_order"
              name="display_order"
              type="number"
              inputMode="numeric"
              step={1}
              defaultValue={product.displayOrder}
              className={inputClass}
            />
          </Field>
          <Field
            id="slug"
            label={t("productForm.slug")}
            help={t("productForm.slugHelp", { example: "olive-oil" })}
            error={fieldError("slug")}
            className="sm:col-span-2"
          >
            <input
              id="slug"
              name="slug"
              defaultValue={product.slug}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={80}
              autoCapitalize="none"
              spellCheck={false}
              className={inputClass}
              aria-invalid={Boolean(fieldError("slug"))}
            />
          </Field>
          <label className="flex min-h-11 items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={product.isFeatured}
              className="size-5 accent-leaf-700"
            />
            <span className="font-medium text-leaf-900">{t("productForm.featured")}</span>
          </label>
        </div>
      </section>

      <section>
        <h2 className="font-sans text-lg font-semibold text-leaf-900">
          {t("productForm.contentSection")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("productForm.translationsHint")}</p>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          {CONTENT_LOCALES.map((l) => (
            <fieldset
              key={l}
              lang={l}
              className="space-y-5 rounded-card border border-border bg-background p-5 sm:p-6"
            >
              <legend className="rounded-full bg-leaf-50 px-3 py-1 text-sm font-semibold text-leaf-800">
                {t(`productForm.language.${l}`)}
              </legend>
              <Field id={`name_${l}`} label={t("productForm.name")} error={fieldError(`name_${l}`)}>
                <input
                  id={`name_${l}`}
                  name={`name_${l}`}
                  defaultValue={value(l, "name")}
                  maxLength={200}
                  className={inputClass}
                  aria-invalid={Boolean(fieldError(`name_${l}`))}
                />
              </Field>
              {TEXT_FIELDS.map((f) => (
                <Field
                  key={f.name}
                  id={`${f.name}_${l}`}
                  label={t(`productForm.${f.label}`)}
                  help={"help" in f ? t(`productForm.${f.help}`) : undefined}
                >
                  <textarea
                    id={`${f.name}_${l}`}
                    name={`${f.name}_${l}`}
                    defaultValue={value(l, f.name)}
                    rows={f.rows}
                    className={textareaClass}
                  />
                </Field>
              ))}
              <Field
                id={`origin_${l}`}
                label={t("productForm.origin")}
                help={t("productForm.originHelp")}
              >
                <input
                  id={`origin_${l}`}
                  name={`origin_${l}`}
                  defaultValue={value(l, "origin")}
                  maxLength={300}
                  className={inputClass}
                />
              </Field>
              <Field id={`seo_title_${l}`} label={t("productForm.seoTitle")}>
                <input
                  id={`seo_title_${l}`}
                  name={`seo_title_${l}`}
                  defaultValue={value(l, "seo_title")}
                  maxLength={70}
                  className={inputClass}
                />
              </Field>
              <Field id={`seo_description_${l}`} label={t("productForm.seoDescription")}>
                <textarea
                  id={`seo_description_${l}`}
                  name={`seo_description_${l}`}
                  defaultValue={value(l, "seo_description")}
                  maxLength={170}
                  rows={2}
                  className={textareaClass}
                />
              </Field>
            </fieldset>
          ))}
        </div>
      </section>

      {/* Save bar stays reachable at the bottom of the screen on phones. */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <FormMessage state={state} className="mb-3" />
        <SubmitButton
          label={t("productForm.save")}
          pendingLabel={t("productForm.saving")}
          className="w-full sm:w-auto"
        />
      </div>
    </form>
  );
}
