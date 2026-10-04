import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { businessDefaults } from "@/config/business-defaults";
import { defaultLocale, locales, type AppLocale } from "@/i18n/config";

// Preview card shown when the site is shared on WhatsApp, Facebook, etc.
// Built from brand colours and confirmed text only — no photography.
export const alt = businessDefaults.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requested } = await params;
  const locale = (locales as readonly string[]).includes(requested)
    ? (requested as AppLocale)
    : defaultLocale;
  const t = await getTranslations({ locale, namespace: "footer" });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#1a3b26",
        color: "#ffffff",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -120,
          top: -120,
          width: 520,
          height: 520,
          borderRadius: 9999,
          background: "#245936",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 110,
          width: 150,
          height: 150,
          borderRadius: 9999,
          background: "#eec65a",
          display: "flex",
        }}
      />
      <div style={{ display: "flex", fontSize: 30, color: "#f4dd8f", letterSpacing: 2 }}>
        {`${businessDefaults.city.toUpperCase()} · RWANDA`}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>
          {businessDefaults.name}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 40, color: "#dcefdf" }}>
          {t("tagline")}
        </div>
      </div>
      <div
        style={{ display: "flex", width: 120, height: 8, borderRadius: 8, background: "#e8b03a" }}
      />
    </div>,
    size,
  );
}
