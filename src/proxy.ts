import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

const adminPath = new RegExp(`^/(${routing.locales.join("|")})/admin(/|$)`);

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  if (adminPath.test(request.nextUrl.pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return refreshSupabaseSession(request, response);
  }

  return response;
}

export const config = {
  // Everything except API routes, Next.js internals and files with an extension
  // (robots.txt, sitemap.xml, images, …).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
