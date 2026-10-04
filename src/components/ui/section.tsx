import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

import { Container } from "./container";

type SectionProps = ComponentProps<"section"> & {
  tone?: "default" | "muted" | "primary";
};

const tones = {
  default: "bg-background",
  muted: "bg-muted",
  primary: "bg-primary text-primary-foreground",
} as const;

/** Vertical page section with consistent spacing and an inner Container. */
export function Section({ tone = "default", className, children, ...props }: SectionProps) {
  return (
    <section className={cn("py-12 sm:py-16 lg:py-20", tones[tone], className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}
