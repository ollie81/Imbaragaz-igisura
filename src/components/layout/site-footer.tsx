import { getTranslations } from "next-intl/server";

import { OpeningHours } from "@/components/business/opening-hours";
import { Container } from "@/components/ui/container";
import { formatPhoneForDisplay, telHref, whatsappHref } from "@/lib/utils/phone";
import type { BusinessInfo } from "@/server/business";

type SiteFooterProps = {
  businessName: string;
  business: BusinessInfo | null;
};

/** Footer built only from database values; sections without data are omitted. */
export async function SiteFooter({ businessName, business }: SiteFooterProps) {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-leaf-950 text-leaf-50">
      <Container className="grid gap-8 py-12 sm:grid-cols-3">
        {business && (business.phones.length > 0 || business.whatsapp.length > 0) && (
          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="mb-3 text-lg text-gold-300">
              {t("common.contact")}
            </h2>
            <ul className="space-y-2">
              {business.phones.map((p) => (
                <li key={p.id}>
                  <a href={telHref(p.value)} className="hover:underline">
                    {t("common.call")}: {formatPhoneForDisplay(p.value)}
                  </a>
                </li>
              ))}
              {business.whatsapp.map((w) => (
                <li key={w.id}>
                  <a
                    href={whatsappHref(w.value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {t("common.whatsapp")}: {formatPhoneForDisplay(w.value)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {business && (business.address || business.locationDescription) && (
          <section aria-labelledby="footer-location">
            <h2 id="footer-location" className="mb-3 text-lg text-gold-300">
              {t("common.location")}
            </h2>
            <address className="space-y-1 not-italic">
              {business.address && <p>{business.address}</p>}
              {business.locationDescription && <p>{business.locationDescription}</p>}
              {business.googleMapsUrl && (
                <p>
                  <a
                    href={business.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {t("common.openOnMap")}
                  </a>
                </p>
              )}
            </address>
          </section>
        )}

        {business && business.hours.length > 0 && (
          <section aria-labelledby="footer-hours">
            <h2 id="footer-hours" className="mb-3 text-lg text-gold-300">
              {t("common.openingHours")}
            </h2>
            <OpeningHours hours={business.hours} />
          </section>
        )}
      </Container>
      <div className="border-t border-leaf-800">
        <Container className="py-5 text-sm text-leaf-200">
          © {year} {businessName}. {t("footer.rights")}
        </Container>
      </div>
    </footer>
  );
}
