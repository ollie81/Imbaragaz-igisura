import { getTranslations } from "next-intl/server";

import { OpeningHours } from "@/components/business/opening-hours";
import { Container } from "@/components/ui/container";
import { mainNavigation } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import type { ContactLinks } from "@/lib/business/contact-links";
import type { BusinessInfo } from "@/server/business";

import { BrandLink } from "./brand-link";
import { LocaleSwitcher } from "./locale-switcher";

type SiteFooterProps = {
  business: BusinessInfo;
  contacts: ContactLinks;
};

const headingClass = "mb-4 font-sans text-sm font-semibold tracking-wide text-gold-300 uppercase";
const linkClass = "inline-flex min-h-11 items-center hover:text-white hover:underline";

/** Footer built from database values (or verified defaults); empty sections are omitted. */
export async function SiteFooter({ business, contacts }: SiteFooterProps) {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    // Bottom padding on phones keeps the floating WhatsApp button off the content.
    <footer className="mt-auto bg-leaf-950 pb-20 text-leaf-100 md:pb-0">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr]">
        <div>
          <BrandLink name={business.name} size="lg" />
          <p className="mt-4 max-w-xs text-leaf-200">{t("footer.tagline")}</p>
          <div className="mt-6">
            <LocaleSwitcher label={t("common.language")} tone="inverse" />
          </div>
        </div>

        {(contacts.phones.length > 0 || contacts.whatsappAll.length > 0) && (
          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className={headingClass}>
              {t("common.contact")}
            </h2>
            <ul className="space-y-0">
              {contacts.phones.map((p) => (
                <li key={`tel-${p.e164}`}>
                  <a href={p.href} className={linkClass}>
                    {t("common.call")}: {p.display}
                  </a>
                </li>
              ))}
              {contacts.whatsappAll.map((w) => (
                <li key={`wa-${w.e164}`}>
                  <a href={w.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {t("common.whatsapp")}: {w.display}
                    <span className="sr-only"> {t("common.opensInNewTab")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="footer-location" className="space-y-6">
          {(business.address || business.locationDescription) && (
            <div>
              <h2 id="footer-location" className={headingClass}>
                {t("common.location")}
              </h2>
              <address className="space-y-1 not-italic">
                {business.address && <p>{business.address}</p>}
                {business.locationDescription && <p>{business.locationDescription}</p>}
                <p>{t("common.country")}</p>
              </address>
            </div>
          )}
          {business.hours.length > 0 && (
            <div>
              <h2 className={headingClass}>{t("common.openingHours")}</h2>
              <OpeningHours hours={business.hours} />
            </div>
          )}
        </section>

        <nav aria-labelledby="footer-pages">
          <h2 id="footer-pages" className={headingClass}>
            {t("footer.pages")}
          </h2>
          <ul className="space-y-0">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <div className="border-t border-leaf-900">
        <Container className="py-6 text-sm text-leaf-300">
          © {year} {business.name}. {t("footer.rights")}
        </Container>
      </div>
    </footer>
  );
}
