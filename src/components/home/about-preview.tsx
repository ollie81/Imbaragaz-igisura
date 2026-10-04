import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { ArrowRightIcon, LeafIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionIds } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import type { BusinessInfo } from "@/server/business";

type AboutPreviewProps = {
  business: BusinessInfo;
  /** Hide the "Learn more" link (e.g. on the About page itself). */
  showLink?: boolean;
  headingLevel?: "h1" | "h2";
};

/** About the business: confirmed facts only, plus the business's own text when provided. */
export async function AboutPreview({
  business,
  showLink = true,
  headingLevel = "h2",
}: AboutPreviewProps) {
  const t = await getTranslations();
  const Title = headingLevel;

  return (
    <Section
      tone="primary"
      id={sectionIds.about}
      aria-labelledby="about-title"
      className="relative overflow-hidden"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          {headingLevel === "h1" ? (
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold tracking-wide text-gold-300 uppercase">
                {t("home.about.eyebrow")}
              </p>
              <Title
                id="about-title"
                className="text-4xl leading-tight font-semibold text-white sm:text-5xl"
              >
                {t("home.about.title")}
              </Title>
            </div>
          ) : (
            <SectionHeading
              id="about-title"
              tone="inverse"
              eyebrow={t("home.about.eyebrow")}
              title={t("home.about.title")}
            />
          )}
          <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-leaf-100">
            <p>{t("home.about.text1")}</p>
            <p>{t("home.about.text2", { years: business.experienceYears })}</p>
            {business.about && <p>{business.about}</p>}
          </div>
          {showLink && (
            <Link
              href="/about"
              className={buttonStyles({ variant: "accent", size: "lg", className: "mt-8" })}
            >
              {t("common.learnMore")}
              <ArrowRightIcon />
            </Link>
          )}
        </div>

        {/* Decorative emblem built from the confirmed years of experience. */}
        <div
          aria-hidden="true"
          className="relative mx-auto grid size-64 place-items-center sm:size-72"
        >
          <span className="absolute inset-0 rounded-full border border-dashed border-gold-400/60" />
          <span className="absolute inset-6 rounded-full bg-leaf-800" />
          <span className="relative text-center">
            <LeafIcon className="mx-auto size-8 text-gold-300" />
            <span className="mt-2 block font-display text-7xl leading-none font-semibold text-white">
              {business.experienceYears}+
            </span>
          </span>
        </div>
      </div>
    </Section>
  );
}
