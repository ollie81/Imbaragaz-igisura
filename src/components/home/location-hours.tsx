import { getTranslations } from "next-intl/server";

import { OpeningHours } from "@/components/business/opening-hours";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClockIcon, MapPinIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionIds } from "@/config/navigation";
import { getDirections } from "@/lib/utils/maps";
import type { BusinessInfo } from "@/server/business";

export async function LocationHours({ business }: { business: BusinessInfo }) {
  const t = await getTranslations();
  const directions = getDirections(business);

  return (
    <Section tone="muted" id={sectionIds.location} aria-labelledby="location-title">
      <SectionHeading
        id="location-title"
        eyebrow={t("home.location.eyebrow")}
        title={t("home.location.title")}
      />

      <div className="mt-10 grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <Card className="flex flex-col gap-5 sm:flex-row">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-leaf-50 text-primary">
            <MapPinIcon className="size-6" />
          </span>
          <div className="flex-1">
            <h3 className="font-sans text-sm font-semibold tracking-wide text-gold-700 uppercase">
              {t("home.location.address")}
            </h3>
            <address className="mt-2 space-y-0.5 text-lg text-leaf-900 not-italic">
              <p className="font-display text-xl font-semibold">{business.name}</p>
              {business.address && <p>{business.address}</p>}
              {business.locationDescription && <p>{business.locationDescription}</p>}
              <p>{t("common.country")}</p>
            </address>
            <a
              href={directions.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "primary", size: "lg", className: "mt-6" })}
            >
              <MapPinIcon />
              {t("home.location.getDirections")}
              <span className="sr-only"> {t("common.opensInNewTab")}</span>
            </a>
            {directions.isApproximate && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("home.location.directionsNote")}
              </p>
            )}
          </div>
        </Card>

        {business.hours.length > 0 && (
          <Card className="flex flex-col gap-5 sm:flex-row">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-100 text-leaf-800">
              <ClockIcon className="size-6" />
            </span>
            <div>
              <h3 className="font-sans text-sm font-semibold tracking-wide text-gold-700 uppercase">
                {t("common.openingHours")}
              </h3>
              <OpeningHours
                hours={business.hours}
                variant="stacked"
                className="mt-2 text-lg text-leaf-900"
              />
            </div>
          </Card>
        )}
      </div>
    </Section>
  );
}
