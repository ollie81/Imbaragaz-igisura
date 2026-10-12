import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, ChatIcon, PhoneIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import type { ContactLinks } from "@/lib/business/contact-links";
import type { BusinessInfo } from "@/server/business";

import { HeroVisual, type HeroImage } from "./hero-visual";

type HeroProps = {
  business: BusinessInfo;
  contacts: ContactLinks;
  image?: HeroImage;
};

export async function Hero({ business, contacts, image }: HeroProps) {
  const t = await getTranslations();
  const phone = contacts.phones[0];

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-leaf-50/60 to-background"
    >
      <Container className="grid items-center gap-10 pt-10 pb-16 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:pt-20 lg:pb-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-leaf-800">
            <span className="size-2 rounded-full bg-gold-400" aria-hidden="true" />
            {business.name} · {t("home.hero.eyebrow")}
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-[2.15rem] leading-[1.12] font-semibold text-leaf-900 sm:text-5xl lg:text-[3.6rem]"
          >
            {t("home.hero.title", { years: business.experienceYears })}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {business.tagline ?? t("home.hero.description")}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Link
              href="/products"
              className={buttonStyles({ size: "lg", className: "col-span-2 sm:col-span-1" })}
            >
              {t("common.exploreProducts")}
              <ArrowRightIcon />
            </Link>
            {contacts.whatsapp && (
              <a
                href={contacts.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "accent", size: "lg" })}
              >
                <ChatIcon />
                {t("common.whatsapp")}
                <span className="sr-only"> {t("common.opensInNewTab")}</span>
              </a>
            )}
            {phone && (
              <a
                href={phone.href}
                aria-label={t("common.callNumber", { number: phone.display })}
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                <PhoneIcon />
                {t("common.call")}
              </a>
            )}
          </div>
        </div>

        <HeroVisual
          image={image}
          className="max-w-[240px] animate-fade-up sm:max-w-sm lg:max-w-md"
        />
      </Container>
    </section>
  );
}
