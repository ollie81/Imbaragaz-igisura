import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { ChatIcon, PhoneIcon } from "@/components/ui/icons";
import type { ContactLinks } from "@/lib/business/contact-links";

/** "Can't find what you need?" — contact prompt shown under the product list. */
export async function CatalogHelp({ contacts }: { contacts: ContactLinks }) {
  const t = await getTranslations();
  const phone = contacts.phones[0];
  if (!contacts.whatsapp && !phone) return null;

  return (
    <aside
      aria-labelledby="catalog-help-title"
      className="mt-14 flex flex-col gap-6 rounded-[1.75rem] border border-gold-200 bg-gradient-to-br from-gold-50 to-background p-6 shadow-card sm:p-10 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="max-w-xl">
        <h2 id="catalog-help-title" className="text-2xl font-semibold text-leaf-900 sm:text-3xl">
          {t("products.helpTitle")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("products.helpText")}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
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
        {phone && (
          <a href={phone.href} className={buttonStyles({ variant: "outline", size: "lg" })}>
            <PhoneIcon />
            <span>
              {t("common.call")} <span className="whitespace-nowrap">{phone.display}</span>
            </span>
          </a>
        )}
      </div>
    </aside>
  );
}
