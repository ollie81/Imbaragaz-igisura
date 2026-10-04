import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "start" | "center";
  tone?: "default" | "inverse";
  className?: string;
};

/** Eyebrow + h2 + optional intro paragraph, used at the top of page sections. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "start",
  tone = "default",
  className,
}: SectionHeadingProps) {
  const inverse = tone === "inverse";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-sm font-semibold tracking-wide uppercase",
            inverse ? "text-gold-300" : "text-gold-700",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          "text-3xl leading-tight font-semibold sm:text-4xl",
          inverse ? "text-white" : "text-leaf-900",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            inverse ? "text-leaf-100" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
