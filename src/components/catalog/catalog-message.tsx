import type { ReactNode } from "react";

import { SproutIcon } from "@/components/ui/icons";

type CatalogMessageProps = {
  title: string;
  text: string;
  children?: ReactNode;
  icon?: ReactNode;
  headingLevel?: "h1" | "h2" | "h3";
};

/** Friendly full-width message for empty, no-results and error states. */
export function CatalogMessage({
  title,
  text,
  children,
  icon,
  headingLevel = "h2",
}: CatalogMessageProps) {
  const Heading = headingLevel;
  return (
    <div className="rounded-card border border-dashed border-leaf-200 bg-leaf-50/60 px-6 py-12 text-center sm:px-10">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-background text-primary shadow-card [&_svg]:size-8">
        {icon ?? <SproutIcon />}
      </span>
      <Heading className="mx-auto mt-6 max-w-lg text-2xl font-semibold text-leaf-900">
        {title}
      </Heading>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{text}</p>
      {children && (
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {children}
        </div>
      )}
    </div>
  );
}
