"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** Shown when products cannot be loaded (e.g. database unreachable). */
export default function ProductsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // Only these three strings are sent to the browser (see the site layout).
  const t = useTranslations("products");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16">
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-card border border-gold-200 bg-accent-soft px-6 py-12 text-center"
      >
        <h1 className="text-2xl font-semibold text-leaf-900">{t("errorTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("errorText")}</p>
        <button
          type="button"
          onClick={() => retry()}
          className={buttonStyles({ size: "lg", className: "mt-7" })}
        >
          {t("retry")}
        </button>
      </div>
    </Container>
  );
}
