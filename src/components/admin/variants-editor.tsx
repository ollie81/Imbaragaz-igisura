"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";

import { deleteVariantAction, saveVariantAction } from "@/server/admin/product-actions";
import { idleState } from "@/server/admin/form";

import { FormMessage, inputClass, SubmitButton, useFieldError } from "./fields";

export type VariantValues = {
  id: string;
  label: string | null;
  sizeValue: number | null;
  sizeUnit: string | null;
  price: number | null;
  currency: string;
  isAvailable: boolean;
  isDefault: boolean;
  displayOrder: number;
};

const UNITS = ["ml", "l", "g", "kg", "piece", "pack"] as const;

function VariantForm({ productId, variant }: { productId: string; variant?: VariantValues }) {
  const t = useTranslations("admin");
  const [state, action] = useActionState(saveVariantAction, idleState);
  const fieldError = useFieldError(state);
  const formRef = useRef<HTMLFormElement>(null);
  const prefix = variant ? `v-${variant.id}` : "v-new";

  // Clear the "add size" form after a successful save.
  useEffect(() => {
    if (!variant && state.status === "success") formRef.current?.reset();
  }, [state.at, state.status, variant]);

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <form ref={formRef} action={action} aria-label={variant ? undefined : t("variants.add")}>
        <input type="hidden" name="product_id" value={productId} />
        {variant && <input type="hidden" name="id" value={variant.id} />}
        <input type="hidden" name="display_order" value={variant?.displayOrder ?? 0} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_6rem_6rem_8rem_5.5rem]">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor={`${prefix}-label`} className="mb-1 block text-xs font-semibold">
              {t("variants.label")}
            </label>
            <input
              id={`${prefix}-label`}
              name="label"
              defaultValue={variant?.label ?? ""}
              maxLength={80}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${prefix}-size`} className="mb-1 block text-xs font-semibold">
              {t("variants.sizeValue")}
            </label>
            <input
              id={`${prefix}-size`}
              name="size_value"
              inputMode="decimal"
              defaultValue={variant?.sizeValue ?? ""}
              className={inputClass}
              aria-invalid={Boolean(fieldError("size_value"))}
            />
          </div>
          <div>
            <label htmlFor={`${prefix}-unit`} className="mb-1 block text-xs font-semibold">
              {t("variants.unit")}
            </label>
            <select
              id={`${prefix}-unit`}
              name="size_unit"
              defaultValue={variant?.sizeUnit ?? ""}
              className={inputClass}
            >
              <option value="">{t("variants.noUnit")}</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {t(`units.${u}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${prefix}-price`} className="mb-1 block text-xs font-semibold">
              {t("variants.price")}
            </label>
            <input
              id={`${prefix}-price`}
              name="price"
              inputMode="decimal"
              defaultValue={variant?.price ?? ""}
              className={inputClass}
              aria-invalid={Boolean(fieldError("price"))}
            />
          </div>
          <div>
            <label htmlFor={`${prefix}-currency`} className="mb-1 block text-xs font-semibold">
              {t("variants.currency")}
            </label>
            <input
              id={`${prefix}-currency`}
              name="currency"
              defaultValue={variant?.currency ?? "RWF"}
              maxLength={3}
              autoCapitalize="characters"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="is_available"
              defaultChecked={variant?.isAvailable ?? true}
              className="size-5 accent-leaf-700"
            />
            {t("variants.available")}
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="is_default"
              defaultChecked={variant?.isDefault ?? false}
              className="size-5 accent-leaf-700"
            />
            {t("variants.isDefault")}
          </label>
          <div className="ml-auto flex gap-2">
            <SubmitButton
              label={variant ? t("variants.save") : t("variants.add")}
              variant={variant ? "outline" : "primary"}
            />
          </div>
        </div>
        <FormMessage state={state} className="mt-3" />
      </form>
      {variant && (
        <form action={deleteVariantAction} className="mt-1 flex justify-end">
          <input type="hidden" name="id" value={variant.id} />
          <SubmitButton
            label={t("variants.delete")}
            variant="ghost"
            confirm={t("variants.deleteConfirm")}
            className="text-red-700"
          />
        </form>
      )}
    </div>
  );
}

export function VariantsEditor({
  productId,
  variants,
}: {
  productId: string;
  variants: VariantValues[];
}) {
  const t = useTranslations("admin.variants");

  return (
    <section className="rounded-card border border-border bg-muted/50 p-5 sm:p-6">
      <h2 className="font-sans text-lg font-semibold text-leaf-900">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
      <div className="mt-5 space-y-3">
        {variants.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        {variants.map((v) => (
          <VariantForm key={v.id} productId={productId} variant={v} />
        ))}
        <VariantForm productId={productId} />
      </div>
    </section>
  );
}
