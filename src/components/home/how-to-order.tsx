import { getTranslations } from "next-intl/server";

import { BusIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

/** Three simple steps, plus honest information about sending orders by bus. */
export async function HowToOrder() {
  const t = await getTranslations("home.order");
  const steps = [
    { title: t("step1Title"), text: t("step1Text") },
    { title: t("step2Title"), text: t("step2Text") },
    { title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <Section aria-labelledby="order-title">
      <SectionHeading id="order-title" eyebrow={t("eyebrow")} title={t("title")} />

      <ol className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
        {/* Connecting line between the step numbers */}
        <span
          aria-hidden="true"
          className="absolute top-6 bottom-6 left-6 w-px bg-leaf-200 md:top-6 md:right-[16%] md:bottom-auto md:left-[16%] md:h-px md:w-auto"
        />
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="relative flex gap-5 md:flex-col md:items-center md:text-center"
          >
            <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-primary font-display text-xl font-semibold text-white ring-8 ring-background">
              {i + 1}
            </span>
            <div>
              <h3 className="font-sans text-lg font-semibold text-leaf-900">{step.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <aside
        aria-labelledby="delivery-title"
        className="mt-12 flex flex-col gap-4 rounded-card border border-gold-200 bg-accent-soft p-6 sm:flex-row sm:p-8"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-300 text-leaf-950">
          <BusIcon className="size-6" />
        </span>
        <div>
          <h3 id="delivery-title" className="font-sans text-lg font-semibold text-leaf-900">
            {t("deliveryTitle")}
          </h3>
          <p className="mt-2 leading-relaxed text-leaf-900">{t("deliveryText")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("deliveryNote")}</p>
        </div>
      </aside>
    </Section>
  );
}
