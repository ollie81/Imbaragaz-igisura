import { publicEnv } from "./env";

/**
 * Technical site configuration only.
 *
 * Business facts (contacts, hours, address, products, prices …) are NOT kept
 * here — they come from the database so the family can edit them. The brand
 * name below is only a fallback for metadata when the database is unreachable.
 */
export const siteConfig = {
  url: publicEnv.siteUrl,
  fallbackName: "Imbaraga z'Igisura",
  /** Seconds that public pages may be served from cache before refreshing. */
  revalidateSeconds: 300,
} as const;
