import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { ChatIcon, PhoneIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { sectionIds } from "@/config/navigation";
import type { ContactLinks } from "@/lib/business/contact-links";

/** Large, thumb-friendly WhatsApp and call buttons for every listed number. */
export async function ContactCta({ contacts }: { contacts: ContactLinks }) {
  const t = await getTranslations();
  if (!contacts.whatsapp && contacts.phones.length === 0) return null;
  const otherWhatsapp = contacts.whatsappAll.slice(1);

  return (
    <Section id={sectionIds.contact} aria-labelledby="contact-title">
      <div className="overflow-hidden rounded-[1.75rem] border border-gold-200 bg-gradient-to-br from-gold-50 to-background px-4 py-8 shadow-card sm:p-10 lg:p-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="contact-title" className="text-3xl font-semibold text-leaf-900 sm:text-4xl">
            {t("home.contact.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("home.contact.description")}</p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.whatsapp && (
            <a
              href={contacts.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("common.whatsappNumber", { number: contacts.whatsapp.display })}
              className={buttonStyles({
                variant: "accent",
                size: "xl",
                className: "sm:col-span-2 lg:col-span-1",
              })}
            >
              <ChatIcon />
              {t("common.whatsapp")}
            </a>
          )}
          {contacts.phones.map((phone) => (
            <a
              key={phone.e164}
              href={phone.href}
              className={buttonStyles({ variant: "primary", size: "xl" })}
            >
              <PhoneIcon />
              <span>
                {t("common.call")} <span className="whitespace-nowrap">{phone.display}</span>
              </span>
            </a>
          ))}
        </div>

        {otherWhatsapp.length > 0 && (
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {otherWhatsapp.map((w) => (
              <a
                key={w.e164}
                href={w.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("home.contact.alsoWhatsapp", { number: w.display })}
                <span className="sr-only"> {t("common.opensInNewTab")}</span>
              </a>
            ))}
          </p>
        )}
      </div>
    </Section>
  );
}
