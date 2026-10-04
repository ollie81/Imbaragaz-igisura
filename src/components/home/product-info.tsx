import { getTranslations } from "next-intl/server";

import { CheckIcon, InfoIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

/** Explains what product pages will contain, with a calm, non-medical safety note. */
export async function ProductInfo() {
  const t = await getTranslations("home.info");
  const fields = [
    t("name"),
    t("productDescription"),
    t("traditionalUse"),
    t("usage"),
    t("sizes"),
    t("price"),
    t("origin"),
    t("warnings"),
  ];

  return (
    <Section tone="muted" aria-labelledby="info-title">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <SectionHeading
          id="info-title"
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
        <div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <li
                key={field}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5 font-medium text-leaf-900"
              >
                <CheckIcon className="size-5 shrink-0 text-leaf-500" />
                {field}
              </li>
            ))}
          </ul>
          <aside
            aria-labelledby="info-note-title"
            className="mt-6 flex gap-3 rounded-2xl bg-background/70 p-5 text-sm leading-relaxed text-muted-foreground"
          >
            <InfoIcon className="mt-0.5 size-5 shrink-0 text-leaf-600" />
            <div>
              <h3 id="info-note-title" className="font-sans font-semibold text-leaf-900">
                {t("noteTitle")}
              </h3>
              <p className="mt-1">{t("note")}</p>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  );
}
