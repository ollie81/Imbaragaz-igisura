import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// The admin area is never indexed (the proxy also sends X-Robots-Tag).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const messages = await getMessages();
  return (
    // Admin forms are client components; give them only the admin texts.
    <NextIntlClientProvider messages={{ admin: messages.admin }}>
      <div className="flex min-h-dvh flex-col bg-muted">{children}</div>
    </NextIntlClientProvider>
  );
}
