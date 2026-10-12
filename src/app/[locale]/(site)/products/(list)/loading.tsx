"use client";

import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

/**
 * Skeleton shown while products load (e.g. after choosing a category).
 *
 * A client component on purpose: Next.js may render this fallback before the
 * page has set the request language, and server-side translation lookups
 * would then read request headers, which breaks cached product pages. Its
 * text comes from the small message set provided by the site layout.
 */
export default function ProductsLoading() {
  const t = useTranslations("products");

  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{t("loading")}</span>
      <div className="border-b border-border bg-gradient-to-b from-leaf-50 to-background">
        <Container className="py-10 sm:py-14" aria-hidden="true">
          <div className="h-4 w-32 rounded-full bg-leaf-100" />
          <div className="mt-4 h-10 w-72 max-w-full rounded-full bg-leaf-100" />
          <div className="mt-6 h-5 w-full max-w-xl rounded-full bg-leaf-100/70" />
          <div className="mt-8 h-14 w-full max-w-2xl rounded-full bg-white shadow-card" />
        </Container>
      </div>
      <Container className="py-8 sm:py-10" aria-hidden="true">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-11 w-28 shrink-0 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="overflow-hidden rounded-card border border-border">
              <div className="aspect-[4/3] animate-pulse bg-leaf-50" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
                <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
