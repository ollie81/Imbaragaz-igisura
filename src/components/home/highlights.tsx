import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/container";
import { CalendarIcon, ClockIcon, MapPinIcon, SupportIcon } from "@/components/ui/icons";
import { localeMeta, type AppLocale } from "@/i18n/config";
import { formatTimeForLocale, getUniformDailyHours } from "@/lib/utils/hours";
import type { BusinessInfo } from "@/server/business";

/** Compact facts strip below the hero. Each fact is shown only if it is known. */
export async function Highlights({ business }: { business: BusinessInfo }) {
  const [t, locale] = await Promise.all([getTranslations(), getLocale() as Promise<AppLocale>]);
  const { hour12 } = localeMeta[locale];
  const hours = getUniformDailyHours(business.hours);

  const items: { icon: ReactNode; value: ReactNode; label: string }[] = [
    {
      icon: <CalendarIcon />,
      value: t("home.highlights.experienceValue", { years: business.experienceYears }),
      label: t("home.highlights.experienceLabel"),
    },
  ];
  if (business.city) {
    items.push({ icon: <MapPinIcon />, value: business.city, label: t("common.country") });
  }
  if (hours) {
    items.push({
      icon: <ClockIcon />,
      value: (
        <>
          <span className="whitespace-nowrap">
            {formatTimeForLocale(hours.opensAt, locale, hour12)}
          </span>{" "}
          –{" "}
          <span className="whitespace-nowrap">
            {formatTimeForLocale(hours.closesAt, locale, hour12)}
          </span>
        </>
      ),
      label: t("home.highlights.everyDay"),
    });
  }
  if (business.phones.length > 0 || business.whatsapp.length > 0) {
    items.push({
      icon: <SupportIcon />,
      value: t("home.highlights.contactValue"),
      label: t("home.highlights.contactLabel"),
    });
  }

  return (
    <section aria-labelledby="highlights-title" className="relative z-10 -mt-8 sm:-mt-10">
      <h2 id="highlights-title" className="sr-only">
        {t("home.highlights.label")}
      </h2>
      <Container>
        <ul className="grid grid-cols-2 overflow-hidden rounded-card border border-border bg-background shadow-lift lg:grid-cols-4">
          {items.map((item, i) => (
            <li
              key={item.label}
              className={[
                "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-6",
                i % 2 === 1 ? "border-l border-border" : "",
                i >= 2 ? "border-t border-border lg:border-t-0" : "",
                i === 2 ? "lg:border-l" : "",
              ].join(" ")}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-leaf-50 text-primary [&_svg]:size-5">
                {item.icon}
              </span>
              <span>
                <span className="block font-display text-lg leading-tight font-semibold text-leaf-900 sm:text-xl">
                  {item.value}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{item.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
