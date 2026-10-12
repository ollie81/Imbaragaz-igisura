"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import {
  createCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  updateCategoryAction,
} from "@/server/admin/product-actions";
import { idleState } from "@/server/admin/form";

import { FormMessage, inputClass, SubmitButton, useFieldError } from "./fields";

export type CategoryValues = {
  id: string;
  slug: string;
  isActive: boolean;
  names: Partial<Record<string, string>>;
  productCount: number;
};

const LOCALES = ["rw", "en"] as const;

function CategoryRow({
  category,
  isFirst,
  isLast,
}: {
  category: CategoryValues;
  isFirst: boolean;
  isLast: boolean;
}) {
  const t = useTranslations("admin");
  const [state, action] = useActionState(updateCategoryAction, idleState);
  const fieldError = useFieldError(state);
  const id = (name: string) => `cat-${category.id}-${name}`;

  return (
    <li className="rounded-2xl border border-border bg-background p-4">
      <form action={action}>
        <input type="hidden" name="id" value={category.id} />
        <div className="grid gap-3 sm:grid-cols-3">
          {LOCALES.map((l) => (
            <div key={l}>
              <label htmlFor={id(`name_${l}`)} className="mb-1 block text-xs font-semibold">
                {t("categories.name", { language: t(`productForm.language.${l}`) })}
              </label>
              <input
                id={id(`name_${l}`)}
                name={`name_${l}`}
                lang={l}
                defaultValue={category.names[l] ?? ""}
                maxLength={100}
                className={inputClass}
                aria-invalid={Boolean(fieldError(`name_${l}`))}
              />
            </div>
          ))}
          <div>
            <label htmlFor={id("slug")} className="mb-1 block text-xs font-semibold">
              {t("categories.slug")}
            </label>
            <input
              id={id("slug")}
              name="slug"
              defaultValue={category.slug}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              autoCapitalize="none"
              spellCheck={false}
              className={inputClass}
              aria-invalid={Boolean(fieldError("slug"))}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={category.isActive}
              className="size-5 accent-leaf-700"
            />
            {t("categories.active")}
          </label>
          <span className="text-sm text-muted-foreground">
            {t("categories.productCount", { count: category.productCount })}
          </span>
          <SubmitButton label={t("categories.save")} variant="outline" className="ml-auto" />
        </div>
        <FormMessage state={state} className="mt-3" />
      </form>
      {/* Separate forms: a formAction button's name/value would collide with
          the identifier React uses to route the submission. */}
      <div className="mt-2 flex flex-wrap justify-end gap-1 border-t border-border pt-2">
        {(["up", "down"] as const).map((direction) => (
          <form key={direction} action={moveCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="direction" value={direction} />
            <button
              type="submit"
              disabled={direction === "up" ? isFirst : isLast}
              aria-label={t(direction === "up" ? "categories.moveUp" : "categories.moveDown")}
              title={t(direction === "up" ? "categories.moveUp" : "categories.moveDown")}
              className={buttonStyles({ variant: "ghost", className: "px-3" })}
            >
              {direction === "up" ? "↑" : "↓"}
            </button>
          </form>
        ))}
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={category.id} />
          <SubmitButton
            label={t("categories.delete")}
            variant="ghost"
            confirm={t("categories.deleteConfirm")}
            className="text-red-700"
          />
        </form>
      </div>
    </li>
  );
}

function NewCategoryForm() {
  const t = useTranslations("admin");
  const [state, action] = useActionState(createCategoryAction, idleState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.at, state.status]);

  return (
    <form
      ref={formRef}
      action={action}
      aria-labelledby="new-category-title"
      className="rounded-card border border-border bg-muted/50 p-5"
    >
      <h2 id="new-category-title" className="font-sans text-lg font-semibold text-leaf-900">
        {t("categories.addTitle")}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {LOCALES.map((l) => (
          <div key={l}>
            <label htmlFor={`new-cat-${l}`} className="mb-1 block text-xs font-semibold">
              {t("categories.name", { language: t(`productForm.language.${l}`) })}
            </label>
            <input
              id={`new-cat-${l}`}
              name={`name_${l}`}
              lang={l}
              maxLength={100}
              className={inputClass}
            />
          </div>
        ))}
      </div>
      <FormMessage state={state} className="mt-3" />
      <SubmitButton label={t("categories.add")} className="mt-4" />
    </form>
  );
}

export function CategoriesManager({ categories }: { categories: CategoryValues[] }) {
  const t = useTranslations("admin.categories");
  return (
    <div className="space-y-6">
      <NewCategoryForm />
      {categories.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-3">
          {categories.map((category, i) => (
            <CategoryRow
              key={category.id}
              category={category}
              isFirst={i === 0}
              isLast={i === categories.length - 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
