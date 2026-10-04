import { getTranslations } from "next-intl/server";

import { buttonStyles } from "@/components/ui/button";
import { ChatIcon, PhoneIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { formatPhoneForDisplay, telHref, whatsappHref } from "@/lib/utils/phone";
import type { BusinessContact } from "@/server/business";

type ContactActionsProps = {
  phones: BusinessContact[];
  whatsapp: BusinessContact[];
  className?: string;
};

/** Primary "Call" and "WhatsApp" buttons, built from database contacts. */
export async function ContactActions({ phones, whatsapp, className }: ContactActionsProps) {
  const t = await getTranslations("common");
  const phone = phones.find((p) => p.is_primary) ?? phones[0];
  const chat = whatsapp.find((w) => w.is_primary) ?? whatsapp[0];
  if (!phone && !chat) return null;

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      {chat && (
        <a
          href={whatsappHref(chat.value)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("whatsappNumber", { number: formatPhoneForDisplay(chat.value) })}
          className={buttonStyles({ variant: "accent", size: "lg" })}
        >
          <ChatIcon />
          {t("whatsapp")}
        </a>
      )}
      {phone && (
        <a
          href={telHref(phone.value)}
          aria-label={t("callNumber", { number: formatPhoneForDisplay(phone.value) })}
          className={buttonStyles({ variant: "primary", size: "lg" })}
        >
          <PhoneIcon />
          {t("call")}
        </a>
      )}
    </div>
  );
}
