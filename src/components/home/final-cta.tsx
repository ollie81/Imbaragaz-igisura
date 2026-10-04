import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, ChatIcon } from "@/components/ui/icons";
import { sectionIds } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import type { ContactLinks } from "@/lib/business/contact-links";

export async function FinalCta({ name, contacts }: { name: string; contacts: ContactLinks }) {
  const t = await getTranslations();

  return (
    <section aria-labelledby="final-title" className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-leaf-900 px-6 py-12 text-center sm:px-12 sm:py-16">
          <span
            aria-hidden="true"
            className="absolute -top-16 -right-16 size-56 rounded-full bg-leaf-800"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-20 -left-10 size-48 rounded-full bg-gold-400/15"
          />
          <div className="relative">
            <h2 id="final-title" className="text-3xl font-semibold text-white sm:text-4xl">
              {t("home.final.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-leaf-100">
              {t("home.final.description", { name })}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/#${sectionIds.products}`}
                className={buttonStyles({ variant: "inverse", size: "lg" })}
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
                  {t("common.whatsappUs")}
                  <span className="sr-only"> {t("common.opensInNewTab")}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
