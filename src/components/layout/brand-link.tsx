import Image from "next/image";

import logoFull from "@/assets/brand/logo-full.jpg";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type BrandLinkProps = {
  /** Business name, used as the logo's text alternative. */
  name: string;
  /** "lg" for places with room to spare, e.g. the footer. */
  size?: "md" | "lg";
  className?: string;
};

/**
 * The full business logo (it already contains the name), linking home.
 * Every header and footer uses this component. The small round emblem is
 * only used where space is tiny (browser tab, phone home screen).
 */
export function BrandLink({ name, size = "md", className }: BrandLinkProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex min-h-11 shrink-0 items-center rounded-xl", className)}
    >
      <Image
        src={logoFull}
        alt={name}
        loading="eager"
        sizes={size === "lg" ? "168px" : "84px"}
        className={cn("w-auto rounded-xl shadow-sm", size === "lg" ? "h-28" : "h-14")}
      />
    </Link>
  );
}
