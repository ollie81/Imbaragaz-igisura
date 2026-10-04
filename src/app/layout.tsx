import type { ReactNode } from "react";

import "./globals.css";

// The real root layout (with <html>) is src/app/[locale]/layout.tsx so the
// `lang` attribute matches the page language. This file only exists so that
// src/app/not-found.tsx can render for URLs outside any locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
