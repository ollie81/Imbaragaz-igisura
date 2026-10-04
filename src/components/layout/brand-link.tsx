import { LeafIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type BrandLinkProps = {
  name: string;
  tone?: "default" | "inverse";
  className?: string;
};

/**
 * Text-based brand mark (no logo image exists yet). When a logo is provided,
 * replace the icon badge here and every header/footer updates.
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
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-sm transition-transform group-hover:rotate-[-8deg]">
        <LeafIcon className="size-5" />
      </span>
      <span className="text-[1.05rem] tracking-tight sm:text-lg">{name}</span>
    </Link>
  );
}
