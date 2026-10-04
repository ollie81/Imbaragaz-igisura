import type { routing } from "@/i18n/routing";
import type messages from "@/messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    // English is the reference catalog; other languages must have the same keys.
    Messages: typeof messages;
  }
}
