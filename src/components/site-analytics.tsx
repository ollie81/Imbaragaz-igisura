"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics (cookieless, no personal data). Admin pages are left
 * out so the numbers show only what customers do.
 */
export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => (new URL(event.url).pathname.includes("/admin") ? null : event)}
    />
  );
}
