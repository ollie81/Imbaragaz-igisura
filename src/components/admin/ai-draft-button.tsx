"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { draftProductTextAction, type ProductDraftInput } from "@/server/admin/ai-draft";

const CONTENT_LOCALES = ["rw", "en"] as const;

/** Every text box the product form shows, so the AI sees what is already written. */
const FORM_TEXT_FIELDS = [
  "short_description",
  "description",
  "traditional_use",
  "usage_instructions",
  "ingredients",
  "warnings",
  "origin",
  "storage_instructions",
  "seo_title",
  "seo_description",
] as const;

/** Marks boxes the AI filled until the manager has looked at them. */
const HIGHLIGHT = ["ring-2", "ring-gold-300"];

type Message = { tone: "info" | "error"; text: string };

/**
 * Asks the AI for a draft and puts it into the EMPTY boxes of the product
 * form. Nothing is saved until the manager reviews it and taps Save.
 */
export function AiDraftButton({ formRef }: { formRef: RefObject<HTMLFormElement | null> }) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message | null>(null);

  const field = (name: string) => {
    const el = formRef.current?.elements.namedItem(name);
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el : null;
  };

  function run() {
    const form = formRef.current;
    if (!form) return;

    const input: ProductDraftInput = { names: {}, category: null, existing: {} };
    for (const l of CONTENT_LOCALES) {
      input.names[l] = field(`name_${l}`)?.value.trim() ?? "";
      input.existing[l] = Object.fromEntries(
        FORM_TEXT_FIELDS.map((f) => [f, field(`${f}_${l}`)?.value.trim() ?? ""]).filter(
          ([, value]) => value,
        ),
      );
    }
    const category = form.elements.namedItem("category_id");
    if (category instanceof HTMLSelectElement && category.value) {
      input.category = category.selectedOptions[0]?.text ?? null;
    }

    if (!input.names.rw && !input.names.en) {
      setMessage({ tone: "error", text: t("aiDraft.nameMissing") });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await draftProductTextAction(input);
      if (result.status === "error") {
        setMessage({ tone: "error", text: t(result.message as never) });
        return;
      }
      let filled = 0;
      for (const l of CONTENT_LOCALES) {
        for (const [name, value] of Object.entries(result.draft[l])) {
          const el = field(`${name}_${l}`);
          if (!el || el.value.trim() || !value) continue;
          el.value = value;
          el.classList.add(...HIGHLIGHT);
          el.addEventListener("input", () => el.classList.remove(...HIGHLIGHT), { once: true });
          filled++;
        }
      }
      setMessage(
        filled > 0
          ? { tone: "info", text: t("aiDraft.filled", { count: filled }) }
          : { tone: "info", text: t("aiDraft.nothingToFill") },
      );
    });
  }

  return (
    <div className="rounded-card border border-gold-200 bg-accent-soft p-5 sm:p-6">
      <h3 className="font-sans text-base font-semibold text-leaf-900">{t("aiDraft.title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("aiDraft.intro")}</p>
      <p className="mt-1 text-sm font-medium text-leaf-900">{t("aiDraft.reviewNote")}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full sm:w-auto"
        onClick={run}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? t("aiDraft.working") : t("aiDraft.button")}
      </Button>
      <p
        role="status"
        aria-live="polite"
        className={
          message?.tone === "error" ? "mt-3 text-sm text-red-800" : "mt-3 text-sm text-leaf-900"
        }
      >
        {message?.text}
      </p>
    </div>
  );
}
