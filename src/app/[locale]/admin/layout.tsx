import type { Metadata } from "next";
import type { ReactNode } from "react";

// The admin area is never indexed (the proxy also sends X-Robots-Tag).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-muted">{children}</div>;
}
