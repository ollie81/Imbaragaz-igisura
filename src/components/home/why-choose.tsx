import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { CalendarIcon, SproutIcon, StoreIcon, SupportIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

/** Reasons to choose the business — limited to facts the business has confirmed. */
export async function WhyChoose({ experienceYears }: { experienceYears: number }) {
  const t = await getTranslations("home.why");

  const reasons: { icon: ReactNode; title: string; text: string }[] = [
    {
      icon: <CalendarIcon />,
      title: t("experienceTitle", { years: experienceYears }),
      text: t("experienceText", { years: experienceYears }),
    },
    { icon: <SproutIcon />, title: t("naturalTitle"), text: t("naturalText") },
    { icon: <SupportIcon />, title: t("personalTitle"), text: t("personalText") },
    { icon: <StoreIcon />, title: t("visitTitle"), text: t("visitText") },
  ];

  return (
    <Section tone="muted" aria-labelledby="why-title">
      <SectionHeading id="why-title" eyebrow={t("eyebrow")} title={t("title")} />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => (
          <li
            key={reason.title}
            className="rounded-card border border-border bg-background p-6 shadow-card"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-gold-100 text-leaf-800 [&_svg]:size-6">
              {reason.icon}
            </span>
            <h3 className="mt-5 font-sans text-lg font-semibold text-leaf-900">{reason.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{reason.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
