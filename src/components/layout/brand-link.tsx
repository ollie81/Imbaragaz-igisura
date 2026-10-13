import Image from "next/image";

import logoMark from "@/assets/brand/logo-mark.png";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type BrandLinkProps = {
  name: string;
  tone?: "default" | "inverse";
  className?: string;
};

/**
 * Brand mark: the round emblem cut from the business logo, followed by the
 * name as text (so it stays sharp, translatable and correctly spelled).
 * Every header and footer uses this component.
 */
export function BrandLink({ name, tone = "default", className }: BrandLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex min-h-11 items-center gap-2.5 rounded-full font-display leading-none font-semibold",
        tone === "inverse" ? "text-white" : "text-leaf-900",
        className,
      )}
    >
      <Image
        src={logoMark}
        alt=""
        width={40}
        height={40}
        loading="eager"
        className="size-10 shrink-0 rounded-full shadow-sm ring-2 ring-white transition-transform group-hover:rotate-[-8deg]"
      />
      <span className="text-[1.05rem] tracking-tight sm:text-lg">{name}</span>
    </Link>
  );
}
