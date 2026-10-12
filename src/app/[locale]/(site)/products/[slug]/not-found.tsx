"use client";

import { useTranslations } from "next-intl";

import { CatalogMessage } from "@/components/catalog/catalog-message";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SearchIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

/**
 * Unknown, draft or unpublished product. A client component for the same
 * reason as products/loading.tsx; its text comes from the site layout.
 */
export default function ProductNotFound() {
  const t = useTranslations();

  return (
    <Container className="py-16">
      <CatalogMessage
        title={t("productPage.notFoundTitle")}
        text={t("productPage.notFoundText")}
        icon={<SearchIcon />}
        headingLevel="h1"
      >
        <Link href="/products" className={buttonStyles({ size: "lg" })}>
          {t("products.showAll")}
        </Link>
      </CatalogMessage>
    </Container>
  );
}
